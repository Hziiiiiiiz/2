document.getElementById('formulaForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. 获取 DOM 元素
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

    // 3. UI 状态重置
    status.textContent = '⏳ 正在渲染动画...（可能需要 10-60 秒）';
    result.innerHTML = '';
    submitBtn.disabled = true;

    try {
        // --- 配置区 ---
        // 必须和你 ngrok 终端显示的 Forwarding 地址完全一致
        const API_BASE = 'https://ladyless-enviably-jim.ngrok-free.dev'; 

        // 4. 发送渲染请求
        const res = await fetch(`${API_BASE}/api/render`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // 关键：跳过 ngrok 免费版的警告页面
                'ngrok-skip-browser-warning': 'true' 
            },
            body: JSON.stringify({ 
                num1: parseInt(num1), 
                num2: parseInt(num2), 
                high_quality: highQuality 
            })
        });

        // 5. 解析后端返回的数据
        const data = await res.json();
        
        if (res.ok) {
            status.textContent = '✅ 渲染完成！';
            
            // 6. 构造视频地址
            // 后端返回的 data.video_url 已经是 "/video/文件名.mp4"
            const videoFullUrl = `${API_BASE}${data.video_url}`;
            const downloadFullUrl = `${API_BASE}${data.download_url}`;

            // 7. 渲染播放器
            result.innerHTML = `
                <div class="video-container" style="margin-top: 20px;">
                    <video controls autoplay playsinline style="width: 100%; border-radius: 8px; background: #000;">
                        <source src="${videoFullUrl}" type="video/mp4">
                        您的浏览器不支持视频播放。
                    </video>
                </div>
                <div style="margin-top: 15px; text-align: center;">
                    <a href="${downloadFullUrl}" 
                       target="_blank" 
                       download 
                       style="padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
                       📥 下载生成的视频
                    </a>
                </div>
            `;
        } else {
            throw new Error(data.error || '后端处理出错');
        }
    } catch (err) {
        console.error('Fetch Error:', err);
        status.textContent = '❌ 错误: ' + (err.message || '连接服务器失败');
    } finally {
        submitBtn.disabled = false;
    }
});