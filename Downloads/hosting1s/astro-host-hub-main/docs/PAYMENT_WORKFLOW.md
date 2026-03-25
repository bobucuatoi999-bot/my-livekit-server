# Workflow thanh toán Hosting1s

## Mục tiêu
- Khách hàng chọn gói ở `Thanh toán`.
- Hệ thống tạo `payment_request` với nội dung chuyển khoản chuẩn.
- Admin đối soát giao dịch và xác nhận trạng thái.
- Khi thanh toán thành công, hệ thống kích hoạt/nâng cấp dịch vụ.

## Luồng nghiệp vụ đề xuất
1. Người dùng đăng nhập và vào `Dashboard > Thanh toán`.
2. Người dùng chọn 1 trong 3 gói (`starter`, `business`, `enterprise`).
3. Người dùng nhập số điện thoại liên hệ.
4. Frontend tạo nội dung chuyển khoản chuẩn: `H1S <PLAN_ID> <SODIENTHOAI>`.
5. Frontend gọi Supabase `insert` vào `payment_requests` với trạng thái `pending`.
6. UI hiển thị lại thông tin chuyển khoản:
   - Số nhận: `0912863155 (Cake)`
   - Nội dung chuyển khoản vừa tạo
   - Số tiền theo gói
7. Admin kiểm tra sao kê:
   - Nếu khớp: cập nhật `status = paid`, `paid_at = now()`
   - Nếu sai: cập nhật `status = rejected` + `admin_note`
8. Frontend dashboard đọc danh sách request của chính user để hiển thị lịch sử và trạng thái.

## Triển khai Supabase
1. Mở Supabase SQL Editor.
2. Chạy file `supabase/payment_schema.sql`.
3. Kiểm tra đã có:
   - `billing_plans`
   - `payment_requests`
   - RLS policies
4. Test nhanh bằng SQL:
   - `select * from public.billing_plans;`
   - đăng nhập app rồi tạo request từ UI.

## Bước frontend tiếp theo (khuyến nghị)
- Đổi dữ liệu cứng `paymentPlans` sang đọc từ `billing_plans`.
- Thêm `paymentService.ts`:
  - `getBillingPlans()`
  - `createPaymentRequest(planId, contactPhone)`
  - `getMyPaymentRequests()`
- Trong dashboard:
  - Sau khi bấm thanh toán, gọi `createPaymentRequest`.
  - Hiển thị toast thành công và mã yêu cầu.
  - Hiển thị bảng lịch sử thanh toán bên dưới.
