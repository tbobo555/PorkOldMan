package controller

import (
    "net/http"
)

// 服務 "[Domain Name]/" (例如:http://porkoldman.com/) 的路由Method.
func HomeServeGet(writer http.ResponseWriter, request *http.Request) {
    if request.URL.Path != "/" {
        http.Error(writer, "Not found", 404)
        return
    }
    if request.Method != "GET" {
        http.Error(writer, "Method not allowed", 405)
        return
    }
    http.ServeFile(writer, request, "public/play.html")
}
