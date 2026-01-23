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

    // 3. UI 状态重置：显示加载中，禁用提交按钮
    status.textContent = '⏳ 正在渲染动画...（可能需要 10-60 秒）';
    status.className = 'loading'; // 使用 CSS 中的 loading 样式
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
                // 重要：跳过 ngrok 免费版的浏览器警告页面，否则 fetch 会报错
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
            status.className = ''; // 移除加载样式
            
            // 6. 构造视频和下载地址
            // 后端返回的 data.video_url 包含 "/video/" 前缀，直接拼接 API_BASE
            const videoFullUrl = `${API_BASE}${data.video_url}`;
            const downloadFullUrl = `${API_BASE}${data.download_url}`;

            // 7. 渲染播放器和下载按钮
            // 加入 playsinline 和 autoplay 提升移动端体验
            result.innerHTML = `
                <div class="video-container" style="margin-top: 20px; text-align: center;">
                    <video controls autoplay playsinline style="width: 100%; max-width: 700px; border-radius: 8px; background: #000; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                        <source src="${videoFullUrl}" type="video/mp4">
                        您的浏览器不支持视频播放，请点击下方按钮下载查看。
                    </video>
                </div>
                <div style="margin-top: 20px; text-align: center;">
                    <a href="${downloadFullUrl}" 
                       target="_blank" 
                       download 
                       style="padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; transition: background 0.3s;">
                       📥 下载生成的 MP4 视频
                    </a>
                </div>
            `;
        } else {
            // 如果后端返回 400 或 500 错误
            throw new Error(data.error || '服务器内部错误');
        }
    } catch (err) {
        console.error('Fetch Error:', err);
        status.textContent = '❌ 错误: ' + (err.message || '无法连接到后端服务器');
        status.className = ''; 
    } finally {
        // 无论成功失败，恢复按钮点击
        submitBtn.disabled = false;
    }
});