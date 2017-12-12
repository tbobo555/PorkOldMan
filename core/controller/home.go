package controller

import (
    "net/http"
    "text/template"
    "log"
    "github.com/gorilla/mux"
    "fmt"
    "porkoldman/core/middleware/sessions"
    "porkoldman/core/middleware/tokens"
    "porkoldman/core"
    "porkoldman/core/middleware"
)

func CheckSessionIdCookie(request *http.Request) bool {
    cookieToken, err := request.Cookie(core.SessionIdCookieName)
    if err == http.ErrNoCookie || cookieToken == nil || cookieToken.Value == "" {
        return false
    }
    token, err := tokens.Manager.Decode(cookieToken.Value)
    if err != nil {
        return false
    }
    isValid, err := tokens.Manager.Verify(token)
    if  err != nil || isValid != true {
        return false
    }
    if isValid == true {
        _, err := sessions.Manager.Get(token.Message)
        if err != nil {
            return false
        }
    }
    return true
}


// 服務 "[Domain Name]/game/downstairs" (例如:http://porkoldman.com/game/downstairs) 的路由Method.
func GameDownStairsServeGet(writer http.ResponseWriter, request *http.Request) {
    isValidCookie := CheckSessionIdCookie(request)
    var session middleware.Session
    var err error
    if isValidCookie == false {
        core.DeleteCookie(writer, core.SessionIdCookieName)
        session, err = sessions.Manager.New()
        if err != nil {
            fmt.Println(err)
            show404(writer, request)
            return
        }
        cookieToken, err := tokens.Manager.New(session.ID, core.TextTokenType)
        if err != nil {
            fmt.Println(err)
            //todo: redirect to error page
        }
        encodedText, err := tokens.Manager.Encode(cookieToken)
        if err != nil {
            fmt.Println(err)
            //todo: redirect to error page
        }
        cookie := core.NewCookie(core.SessionIdCookieName, encodedText, session.Option.Path, session.Option.Domain,
            session.Option.MaxAge, session.Option.Secure, session.Option.HttpOnly)
        http.SetCookie(writer, cookie)
    } else {
        cookie, err := request.Cookie(core.SessionIdCookieName)
        if err != nil {
            fmt.Println(err)
            //todo: redirect to error page
        }
        token, err := tokens.Manager.Decode(cookie.Value)
        if err != nil {
            fmt.Println(err)
            //todo: redirect to error page
        }
        session, err = sessions.Manager.Get(token.Message)
        if err != nil {
            fmt.Println(err)
            //todo: redirect to error page
        }
    }
    socketToken, err := core.MakeRandomContext(32)
    if err != nil {
        fmt.Println(err)
        //todo: redirect to error page
    }
    var randName string
    for {
        randName, err = core.MakeRandomContext(8)
        if err != nil {
            fmt.Println(err)
            //todo: redirect to error page
        }
        if _, ok := session.Values[randName]; !ok {
            break
        }
    }
    session.Values[randName] = socketToken
    err = session.Save()
    if err != nil {
        fmt.Println(err)
        //todo: redirect to error page
    }
    indexTemplate := template.New("downstairs.html")
    indexTemplate.ParseFiles("public/downstairs.html")
    err = indexTemplate.Execute(writer, socketToken)
    if err != nil {
        //todo: redirect to error page
    }
}

// 服務 "[Domain Name]/" (例如:http://porkoldman.com/) 的路由Method.
func IndexServe(writer http.ResponseWriter, request *http.Request) {
    vars := mux.Vars(request)
    var id string
    if _, ok := vars["id"]; ok {
        id = vars["id"]
    } else {
        id = "-1"
    }
    type Recipient struct {
        Name, Gift string
        Attended   bool
    }
    var recipients = []Recipient{
        {"Aunt Mildred", "bone china tea set", true},
        {"Uncle John", "moleskin pants", false},
        {"Cousin Rodney", "", false},
        {"Robert", "<script>alert(123);</script>", false},
        {"Index", "<H1>" + id + "</H1>", false},
    }

    headerTemplate := template.Must(template.ParseFiles("public/header.html"))
    footerTemplate := template.Must(template.ParseFiles("public/footer.html"))
    indexTemplate := template.New("index.html")
    indexTemplate.ParseFiles("public/index.html")
    err := headerTemplate.Execute(writer, nil)
    if err != nil {
        log.Println("executing template:", err)
    }

    err = indexTemplate.Execute(writer, recipients)
    if err != nil {
        log.Println("executing template:", err)
    }

    err = footerTemplate.Execute(writer, nil)
    if err != nil {
        log.Println("executing template:", err)
    }
}
