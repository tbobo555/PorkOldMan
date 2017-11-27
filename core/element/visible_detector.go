package element

import "time"

// VisibleDetector類別，用來偵測與記錄使用者是否將遊戲畫面縮小或隱藏
type VisibleDetector struct {
    MaxWaitingPeriod float32
    Ticker *time.Ticker
    Counter float32
    IsVisible bool
    IsRunning bool
}

// 創建一VisibleDetector物件
func NewVisibleDetector(maxWaitingPeriod float32) *VisibleDetector{
    return &VisibleDetector{
        MaxWaitingPeriod: maxWaitingPeriod,
        Ticker: nil,
        Counter: 0,
        IsVisible: false,
        IsRunning: false,
    }
}

// 將VisibleDetector開始啟動，會將計數器開始計數，
// 若計數超過指定設定(MaxWaitingPeriod)，則代表使用者已將遊戲畫面縮小或隱藏
func (vd *VisibleDetector) Run() {
    if vd.IsRunning == true {
        return
    }
    vd.IsRunning = true
    vd.Ticker = time.NewTicker(time.Millisecond * 100)
    defer func() {
        vd.Stop()
    }()
    for {
        select {
        case <-vd.Ticker.C:
            if vd.Counter >= vd.MaxWaitingPeriod {
                vd.IsVisible = false
            }
            if vd.Counter >= 300 {
                vd.Counter = vd.MaxWaitingPeriod
            }
            vd.Counter += 0.1
        }
    }
}

// 重置VisibleDetector，將計數歸0
func (vd *VisibleDetector) Reset() {
    vd.Counter = 0
    vd.IsVisible = true
}
// 暫停VisibleDetector，將計數歸0
func (vd *VisibleDetector) Stop() {
    vd.Counter = 0
    vd.IsRunning = false
    vd.Ticker.Stop()
}
