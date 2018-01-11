package controller

import (
    "net/http"
    "text/template"
    "github.com/gorilla/mux"
    "porkoldman/core/config"
    "porkoldman/core/block/downstairs"
    "porkoldman/core/middleware/log"
    "porkoldman/core"
    "fmt"
)

// 服務 "[Domain Name]/game/downstairs" (例如:http://porkoldman.com/game/downstairs) 的路由Method.
func GameDownStairsServeGet(writer http.ResponseWriter, request *http.Request) {
    homeBolck := &downstairs.Home{}
    status, err := homeBolck.Load(writer, request)
    if err != nil {
        core.ShowErrorPage(writer, status)
        log.WriteError(core.AppErrorExceptionStatus, err.Error(), request)
        return
    }
    resp, err := homeBolck.Response()
    if err != nil {
        core.ShowErrorPage(writer, http.StatusInternalServerError)
        log.WriteError(core.AppErrorExceptionStatus, err.Error(), request)
        return
    }
    if _, ok := resp["SocketToken"]; !ok {
        core.ShowErrorPage(writer, http.StatusInternalServerError)
        log.WriteError(core.AppErrorExceptionStatus, err.Error(), request)
        return
    }
    socketToken := resp["SocketToken"]
    indexTemplate := template.New("downstairs.html")
    indexTemplate.ParseFiles(config.ServiceRootPath + "public/downstairs.html")
    err = indexTemplate.Execute(writer, socketToken)
    if err != nil {
        core.ShowErrorPage(writer, http.StatusInternalServerError)
        log.WriteError(core.AppErrorExceptionStatus, err.Error(), request)
        return
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

    headerTemplate := template.Must(template.ParseFiles(config.ServiceRootPath + "public/header.html"))
    footerTemplate := template.Must(template.ParseFiles(config.ServiceRootPath + "public/footer.html"))
    indexTemplate := template.New("index.html")
    indexTemplate.ParseFiles(config.ServiceRootPath + "public/index.html")
    err := headerTemplate.Execute(writer, nil)
    if err != nil {
        fmt.Println("executing template:", err)
    }

    err = indexTemplate.Execute(writer, recipients)
    if err != nil {
        fmt.Println("executing template:", err)
    }

    err = footerTemplate.Execute(writer, nil)
    if err != nil {
        fmt.Println("executing template:", err)
    }
}
