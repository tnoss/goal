// Code generated by Wire. DO NOT EDIT.

//go:generate go run github.com/google/wire/cmd/wire
//go:build !wireinject
// +build !wireinject

package controller

import (
	"github.com/truc9/goal/internal/booking"
	"github.com/truc9/goal/internal/db"
	"github.com/truc9/goal/internal/iam"
	"github.com/truc9/goal/internal/stats"
)

// Injectors from wire.go:

func InitBookingController() BookingController {
	gormDB := db.New()
	bookingService := booking.NewBookingService(gormDB)
	bookingController := NewBookingController(bookingService)
	return bookingController
}

func InitPeriodController() PeriodController {
	gormDB := db.New()
	periodService := booking.NewPeriodService(gormDB)
	periodController := NewPeriodController(periodService)
	return periodController
}

func InitIamController() IamController {
	gormDB := db.New()
	iamService := iam.NewIamService(gormDB)
	iamController := NewIamController(iamService)
	return iamController
}

func InitStatsService() stats.StatsService {
	gormDB := db.New()
	periodService := booking.NewPeriodService(gormDB)
	statsService := stats.NewStatService(gormDB, periodService)
	return statsService
}
