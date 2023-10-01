package iam

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	_ "github.com/joho/godotenv/autoload"
	"github.com/samber/lo"
	"github.com/truc9/goal/internal/config"
	"github.com/truc9/goal/internal/entity"
	"gorm.io/gorm"
)

type IamService struct {
	tx *gorm.DB
}

type (
	CustomJwtClaims struct {
		Name  string `json:"name"`
		Email string `json:"email"`
		Role  string `json:"role"`
		jwt.RegisteredClaims
	}
)

func NewIamService(tx *gorm.DB) IamService {
	return IamService{
		tx: tx,
	}
}

func (s IamService) GetAll() []UserModel {
	var users []entity.User
	res := s.tx.Find(&users)
	if res.Error != nil {
		return nil
	}

	result := lo.Map(users, func(u entity.User, _ int) UserModel {
		return UserModel{
			FirstName: u.FirstName,
			LastName:  u.LastName,
			Id:        u.Id,
			Email:     u.Email,
		}
	})

	return result
}

func (sv IamService) RegisterUser(r *RegisterModel) (*entity.User, error) {
	dup := sv.tx.Where("email = ?", r.Email, r.UserName).First(&entity.User{})
	if dup.RowsAffected != 0 {
		return nil, errors.New("email already in use")
	}

	user, err := entity.NewUser(r.FirstName, r.LastName, r.Email, r.UserName)

	if err != nil {
		return nil, err
	}

	user.SetPassword(r.Password)

	res := sv.tx.Create(&user)

	if res.Error != nil {
		return nil, res.Error
	}

	return user, nil
}

func (sv IamService) Login(req LoginModel) (*LoginResult, error) {
	user := entity.User{}
	res := sv.tx.Joins("Role").First(&user, "email=?", req.Email)

	if res.Error != nil {
		return nil, errors.New("user does not exist")
	}

	if !user.VerifyPassword(req.Password) {
		return nil, errors.New("invalid password")
	}

	claimExpiry := jwt.NewNumericDate(time.Now().Add(time.Hour * 3))
	claimId := strconv.FormatUint(uint64(user.Id), 10)

	claims := &CustomJwtClaims{
		fmt.Sprintf("%s %s", user.FirstName, user.LastName),
		user.Email,
		user.Role.Name,
		jwt.RegisteredClaims{
			ID:        claimId,
			ExpiresAt: claimExpiry,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err := token.SignedString([]byte(config.Secret))
	if err != nil {
		return nil, err
	}

	return &LoginResult{
		Id:     user.Id,
		Email:  user.Email,
		Name:   fmt.Sprintf("%s %s", user.FirstName, user.LastName),
		Role:   user.Role.Name,
		Expire: claimExpiry.UnixMilli(),
		Token:  signedToken,
	}, nil
}

func (sv IamService) AssignRole(userId int, ra RoleAssignmentModel) (err error) {
	user := entity.User{}
	if res := sv.tx.Find(&user, userId); res.RowsAffected == 0 {
		return errors.New("user not found")
	}

	role := entity.Role{}
	if res := sv.tx.Find(&role, ra.RoleId); res.RowsAffected == 0 {
		return errors.New("role not found")
	}

	user.SetRole(entity.RoleTypeId(ra.RoleId))

	sv.tx.Save(&user)

	return nil
}
