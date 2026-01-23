document.getElementById('formulaForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. 获取输入元素
    const num1 = document.getElementById('num1').value;
    const num2 = document.getElementById('num2').value;
    const highQuality = document.getElementById('highQuality').checked;
    const status = document.getElementById('status');
    const result = document.getElementById('result');
    const submitBtn = document.querySelector('button');

    // 2. 基础验证
    if (!num1 || !num2 || num1 <= 0 || num2 <= 0) {
        alert('请输入正整数！');
        return;
    }

    // 3. 设置加载状态
    status.textContent = '⏳ 正在渲染动画...（可能需要 10-60 秒）';
    result.innerHTML = '';
    submitBtn.disabled = true;

    try {
        // --- 配置区 ---
        // 确保这里的地址和你 ngrok 终端显示的 Forwarding 地址完全一致
        const API_BASE = 'https://ladyless-enviably-jim.ngrok-free.dev'; 

        // 4. 发送请求到后端
        const res = await fetch(`${API_BASE}/api/render`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // 关键：告诉 ngrok 跳过免费版的浏览器警告中间页
                'ngrok-skip-browser-warning': 'true' 
            },
            body: JSON.stringify({ 
                num1: parseInt(num1), 
                num2: parseInt(num2), 
                high_quality: highQuality 
            })
        });

        // 5. 解析响应
        const data = await res.json();
        
        if (res.ok) {
            status.textContent = '✅ 渲染完成！';
            
            // 6. 渲染视频播放器
            // data.video_url 后端返回的是 "/video/文件名.mp4"
            // data.download_url 后端返回的是 "/download/文件名.mp4"
            result.innerHTML = `
                <div class="video-container">
                    <video controls autoplay name="media" style="width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                        <source src="${API_BASE}${data.video_url}" type="video/mp4">
                        您的浏览器不支持 HTML5 视频。
                    </video>
                </div>
                <div style="margin-top: 15px; text-align: center;">
                    <a href="${API_BASE}${data.download_url}" 
                       target="_blank" 
                       download 
                       style="padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px;">
                       📥 下载生成的视频
                    </a>
                </div>
            `;
        } else {
            throw new Error(data.error || '后端处理出错');
        }
    } catch (err) {
        console.error('Fetch Error:', err);
        status.textContent = '❌ 错误: ' + (err.message || '连接服务器失败，请检查 ngrok 是否开启');
    } finally {
        submitBtn.disabled = false;
    }
});