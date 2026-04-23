export interface PrintData {
    fullName: string;
    cccd: string;
    votingRights: number;
    meetingTitle: string;
    magicLink: string;
}

export const printVotingCard = (data: PrintData) => {
    const { fullName, cccd, votingRights, meetingTitle, magicLink } = data;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Không thể mở cửa sổ in. Vui lòng kiểm tra cài đặt trình chặn cửa sổ bật lên.');
        return;
    }

    const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Thẻ biểu quyết - ${fullName}</title>
            <style>
                @page {
                    size: A4;
                    margin: 0;
                }
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    color: #000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: #fff;
                }
                .ticket {
                    border: 2px solid #000;
                    padding: 40px 60px;
                    width: 750px;
                    height: 275mm; /* Toàn trang A4 */
                    margin: 0;
                    position: relative;
                    text-align: center;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 30px;
                    border-bottom: 2px solid #000;
                    padding-bottom: 20px;
                }
                .header-logo {
                    height: 70px;
                    width: auto;
                }
                .header-text {
                    text-align: left;
                }
                .company-name {
                    font-size: 22px;
                    font-weight: bold;
                    color: #000;
                    text-transform: uppercase;
                    margin-bottom: 5px;
                }
                .meeting-name {
                    font-size: 26px;
                    font-weight: bold;
                    margin: 0;
                    color: #000;
                }
                .content {
                    line-height: 1.8;
                    font-size: 24px;
                    text-align: left;
                    padding: 40px 20px;
                }
                .info-row {
                    margin: 25px 0;
                    display: flex;
                    justify-content: flex-start;
                    gap: 15px;
                }
                .label {
                    font-weight: normal;
                    color: #000;
                }
                .value {
                    font-weight: bold;
                    color: #000;
                    font-size: 26px;
                    text-transform: uppercase;
                }
                .instruction-box {
                    background: #fff;
                    border: 1px dashed #000;
                    padding: 30px;
                    border-radius: 4px;
                    margin: 20px 0;
                }
                .instruction-title {
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 25px;
                    color: #000;
                    border-bottom: 1px solid #000;
                    padding-bottom: 15px;
                    font-size: 18px;
                }
                .login-methods {
                    display: flex;
                    gap: 40px;
                    text-align: left;
                }
                .method {
                    flex: 1;
                }
                .qr-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    margin-top: 10px;
                }
                .qr-placeholder {
                    width: 240px;
                    height: 240px;
                    background-color: #fff;
                    margin: 10px 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #000;
                }
                .manual-details {
                    font-size: 16px;
                    margin-top: 10px;
                    background: #fff;
                    padding: 10px;
                    border: none;
                }
                .detail-item {
                    margin: 15px 0;
                }
                .footer {
                    text-align: center;
                    font-size: 14px;
                    color: #333;
                    border-top: 1px solid #000;
                    padding-top: 20px;
                }
                @media print {
                    body { 
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        margin: 0;
                        padding: 0;
                        height: 297mm;
                        overflow: hidden;
                        -webkit-print-color-adjust: exact;
                    }
                    .ticket { 
                        margin: 0;
                        width: 100%; 
                        max-width: 200mm;
                        height: 275mm;
                        border: 2px solid #000 !important;
                    }
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="ticket">
                <div class="header">
                    <img src="/logo.webp" alt="Logo VIX" class="header-logo" />
                    <div class="header-text">
                        <div class="company-name">Công ty cổ phần Chứng khoán ViX</div>
                        <div class="meeting-name">${meetingTitle}</div>
                    </div>
                </div>
                
                <div class="content">
                    <div class="info-row">
                        <span class="label">Kính gửi quý đại biểu:</span>
                        <span class="value">${fullName}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Số lượng quyền biểu quyết:</span>
                        <span class="value" style="color: #000;">${votingRights.toLocaleString()} CP</span>
                    </div>
                </div>
                
                <div class="instruction-box">
                    <div class="instruction-title">HƯỚNG DẪN ĐĂNG NHẬP BIỂU QUYẾT</div>
                    <div class="login-methods">
                        <div class="method" style="border-right: 1px solid #eee; padding-right: 15px;">
                            <div style="font-weight: bold; font-size: 13px; text-align: center;">Cách 1: Quét mã QR sau</div>
                            <div class="qr-container">
                                <div id="qrcode" class="qr-placeholder"></div>
                                <div style="font-size: 10px; color: #666; text-align: center;">(Quét bằng camera điện thoại hoặc Zalo)</div>
                            </div>
                        </div>
                        <div class="method">
                            <div style="font-weight: bold; font-size: 13px; text-align: center;">Cách 2: Đăng nhập thủ công</div>
                            <div class="manual-details">
                                <div class="detail-item">Trang web: <b>http://dhcd.vix.local</b></div>
                                <div class="detail-item">Tài khoản: <b>${cccd}</b></div>
                                <div class="detail-item">Mật khẩu: <b>${cccd}</b></div>
                            </div>
                            <div style="font-size: 10px; color: #666; margin-top: 10px; font-style: italic;">
                                Lưu ý: Quý đại biểu vui lòng bảo mật thông tin tài khoản.
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    In ngày: ${new Date().toLocaleString('vi-VN')} | Ban tổ chức Đại hội cổ đông ViX
                </div>
            </div>

            <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
            <script>
                window.onload = function() {
                    new QRCode(document.getElementById("qrcode"), {
                        text: "${magicLink}",
                        width: 180,
                        height: 180,
                        colorDark : "#000000",
                        colorLight : "#ffffff",
                        correctLevel : QRCode.CorrectLevel.H
                    });
                    
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
};
