package middleware

import (
    "net/http"
    "porkoldman/core/middleware/realip"
    "github.com/oschwald/geoip2-golang"
    "github.com/mssola/user_agent"
    "net"
)

type ClientManager struct {
    IP string
    Country string
    IsoCode string
    Device string
    Browser string
    BrowserVersion string
    IsUseMobile bool
    request http.Request
}

func NewClientManager(req *http.Request, geoDbPath string) *ClientManager {
    c := &ClientManager{}
    c.IP = realip.FromRequest(req)
    c.initCountry(geoDbPath)
    ua := user_agent.New(req.UserAgent())
    c.Device = ua.Platform()
    c.Browser, c.BrowserVersion = ua.Browser()
    c.IsUseMobile = ua.Mobile()
    c.request = *req
    return c
}

func (c *ClientManager) initCountry(geoDbPath string) {
    db, err := geoip2.Open(geoDbPath)
    if err != nil {
    }
    defer db.Close()
    ip := net.ParseIP(c.IP)
    record, err := db.Country(ip)
    c.Country = record.Country.Names["en"]
    c.IsoCode = record.Country.IsoCode
}
