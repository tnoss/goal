package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h *Handler) GetBookingOverallStats(c echo.Context) (err error) {
	return c.JSON(http.StatusOK, nil)
}
