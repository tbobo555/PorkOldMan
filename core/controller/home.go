package controller

import (
    "net/http"
    "text/template"
    "github.com/gorilla/mux"
    "fmt"
)

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

    headerTemplate := template.Must(template.ParseFiles(FilePath + "header.html"))
    footerTemplate := template.Must(template.ParseFiles(FilePath + "footer.html"))
    indexTemplate := template.New("index.html")
    indexTemplate.ParseFiles(FilePath + "index.html")
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
