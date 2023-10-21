package hrm

import (
	"fmt"
	"log"

	"github.com/samber/lo"
	"github.com/truc9/goal/internal/entity"
	"github.com/truc9/goal/internal/utils/random"
	"gorm.io/gorm"
)

type EmployeeService struct {
	db *gorm.DB
}

func NewEmployeeService(db *gorm.DB) EmployeeService {
	return EmployeeService{
		db: db,
	}
}

func (s EmployeeService) GetAll() ([]EmployeeModel, error) {
	users := []entity.User{}
	if err := s.db.Where("employee_number IS NOT NULL").Order("id asc").Find(&users).Error; err != nil {
		return nil, err
	}

	employees := lo.Map(users, func(item entity.User, index int) EmployeeModel {
		e := EmployeeModel{}
		e.Id = item.Id
		e.IsActive = item.IsActive
		e.EmployeeNumber = item.EmployeeNumber
		e.Uid = item.Uid
		e.FirstName = item.FirstName
		e.LastName = item.LastName
		e.CreatedDate = item.CreatedDate
		e.UpdatedDate = item.UpdatedDate
		e.Email = item.Email
		return e
	})

	return employees, nil
}

func (s EmployeeService) Create(model EmployeeCreateModel) error {
	var dupEmail int64
	s.db.Where("email = ?", model.Email).Find(&entity.User{}).Count(&dupEmail)
	if dupEmail > 0 {
		return fmt.Errorf("%s is already registered for another user", model.Email)
	}

	us, _ := entity.NewUser(model.FirstName, model.LastName, model.Email, fmt.Sprintf("%s.%s", model.FirstName, model.LastName))
	us.EmployeeNumber = random.GenStringId()
	res := s.db.Create(&us)
	return res.Error
}

func (s EmployeeService) BulkCreate(models []EmployeeCreateModel) error {
	users := lo.Map[EmployeeCreateModel, *entity.User](models, func(m EmployeeCreateModel, _ int) *entity.User {
		us, _ := entity.NewUser(m.FirstName, m.LastName, m.Email, fmt.Sprintf("%s.%s", m.FirstName, m.LastName))
		us.EmployeeNumber = random.GenStringId()
		return us
	})
	res := s.db.CreateInBatches(users, len(users))
	return res.Error
}

func (s EmployeeService) AllocEmployeeNumber(userId int64) error {
	user, err := s.getUser(userId)
	if err != nil {
		return err
	}

	empNumber := random.GenStringId()
	var dupEmpNumber int64
	err = s.db.Where("employee_number = ?", empNumber).Find(&entity.User{}).Count(&dupEmpNumber).Error
	if err != nil {
		log.Println(err)
		return err
	}

	if dupEmpNumber > 0 {
		user.AllocateEmployeeNumberWithId(empNumber)
	} else {
		user.AllocateEmployeeNumber(empNumber)
	}

	s.db.Save(&user)
	return nil
}

func (s EmployeeService) ActivateUser(userId int64) (*EmployeeResponse, error) {
	user, err := s.getUser(userId)
	if err != nil {
		return nil, err
	}

	user.Activate()
	s.db.Save(&user)

	return &EmployeeResponse{
		Id:        user.Id,
		FirstName: user.FirstName,
		LastName:  user.LastName,
	}, nil
}

func (s EmployeeService) DeactivateUser(userId int64) (*EmployeeResponse, error) {
	user, err := s.getUser(userId)
	if err != nil {
		return nil, err
	}

	user.Deactivate()
	s.db.Save(&user)

	return &EmployeeResponse{
		Id:        user.Id,
		FirstName: user.FirstName,
		LastName:  user.LastName,
	}, nil
}

func (s EmployeeService) getUser(userId int64) (*entity.User, error) {
	user := &entity.User{}
	if err := s.db.Find(&user, userId).Error; err != nil {
		log.Printf("user not found with id %v", userId)
		return nil, err
	}
	return user, nil
}
