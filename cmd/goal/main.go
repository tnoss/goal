package main

import (
	"net/http"

	jwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/truc9/goal/internal/constants"
	"github.com/truc9/goal/internal/core/enums"
	"github.com/truc9/goal/internal/db"
	"github.com/truc9/goal/internal/handler"
	"github.com/truc9/goal/internal/repository"
	"github.com/truc9/goal/internal/utils/authz"
)

func main() {

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Secure())
	e.Use(middleware.RequestID())

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:5173", "http://*.goal.co.uk"},
		AllowMethods: []string{http.MethodGet, http.MethodPut, http.MethodPost, http.MethodDelete},
	}))

	e.Static("/", "web/dist")

	//TODO: Using Wire Google for DI ?
	db := db.Init()
	repo := repository.NewRepository(db)
	h := &handler.Handler{
		DB:   db,
		Repo: repo,
	}

	a := e.Group("api")
	{
		a.POST("/register", h.RegisterUser)
		a.POST("/login", h.Login)
	}

	r := e.Group("api")
	{
		r.Use(jwt.JWT([]byte(constants.Secret)))
		// accounts
		r.GET("/accounts", h.GetAll)
		r.POST("/accounts/companies", h.CreateCompanyAccount)
		r.POST("/accounts/individuals", h.CreateIndividualAccount)

		// streaming
		r.GET("/streaming", h.Streaming)
		r.GET("/ws", h.HandleWS)

		// periods
		r.POST("/periods", h.CreateNextPeriod, authz.RequireRoles(enums.RoleAdmin))
		r.GET("/periods", h.GetPeriods, authz.RequireRoles(enums.RoleAdmin, enums.RoleUser))
		r.GET("/periods/next", h.GetNextPeriod)
		r.GET("/periods/:bookingPeriodId/my-bookings", h.GetMyBookings)

		// Get booking info of all users
		r.GET("/periods/:bookingPeriodId/bookings", h.GetAllBookings, authz.RequireRoles(enums.RoleAdmin))

		// bookings
		r.POST("/bookings", h.SubmitBooking)
		r.DELETE("/bookings/:bookingId", h.DeleteBooking)

		// stats
		r.GET("/stats/booking-overall", h.GetBookingOverallStats)
	}

	e.Logger.Fatal(e.Start(":8000"))
}
