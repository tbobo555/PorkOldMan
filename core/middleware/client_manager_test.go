package middleware

import (
    "testing"
    "net/http/httptest"
)

func TestClientManager(t *testing.T) {
    req := httptest.NewRequest("GET", "http://example.com/foo", nil)
    req.Header.Add("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36")
    req.RemoteAddr = "114.25.150.22:16"
    c := NewClientManager(req, "../../vendor/GeoLite2-Country.mmdb")

    if c.IP != "114.25.150.22" {
        t.Errorf("Test ClientManager failed, no get expect ip")
    }
    if c.Country != "Taiwan" {
        t.Errorf("Test ClientManager failed, no get expect country")
    }
    if c.IsoCode != "TW" {
        t.Errorf("Test ClientManager failed, no get expect iso code")
    }
    if c.Device != "Macintosh" {
        t.Errorf("Test ClientManager failed, no get expect device")
    }
    if c.Browser != "Chrome" {
        t.Errorf("Test ClientManager failed, no get expect browser")
    }
    if c.BrowserVersion != "63.0.3239.132" {
        t.Errorf("Test ClientManager failed, no get expect browser version")
    }
    if c.IsUseMobile != false {
        t.Errorf("Test ClientManager failed, no get expect is-use-mobile ")
    }
}
