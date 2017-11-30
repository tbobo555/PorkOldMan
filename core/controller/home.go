package controller

import (
    "net/http"
    "text/template"
    "log"
    "github.com/gorilla/mux"
)

// 服務 "[Domain Name]/game/downstairs" (例如:http://porkoldman.com/game/downstairs) 的路由Method.
func GameDownStairsServeGet(writer http.ResponseWriter, request *http.Request) {
    http.ServeFile(writer, request, "public/play.html")
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
