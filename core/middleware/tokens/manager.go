package tokens


import (
    "porkoldman/core/middleware"
)

var Manager  *middleware.TokenManager

func init() {
    Manager = middleware.NewTokenManager()
}
