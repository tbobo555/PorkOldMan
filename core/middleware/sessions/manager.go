package sessions

import (
    "porkoldman/core/middleware"
)


var Manager  *middleware.SessionManager

func init() {
    Manager = middleware.NewSessionManager()
}
