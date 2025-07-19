1.開發的時候以src下的file為主
2.目前的main為
<StrictMode>
     <BrowserRouter>
      <App />
    </BrowserRouter>
</StrictMode>,
這個會使用
任何需要切換頁面的地方
之後都要從React-router或a href改成Django的路徑
3.如果想自己測試玩一些東西的話就創一個test_(後面取啥名隨便反正test開頭).tsx file
然後在main的地方：
<StrictMode>
    <你的test檔名_不需要.tsx_例如:test />
</StrictMode>,
暫時先這樣 如果開工可能會調整