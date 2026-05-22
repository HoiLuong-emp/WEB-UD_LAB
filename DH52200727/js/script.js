document.addEventListener('DOMContentLoaded', () => {
    // --- XỬ LÝ BANNER SLIDER ---
    let index = 0;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length > 0) {
        function changeSlide(n) {
            slides[index].classList.remove('active');
            if(dots.length > 0) dots[index].classList.remove('active');
            
            index = (index + n + slides.length) % slides.length;
            
            slides[index].classList.add('active');
            if(dots.length > 0) dots[index].classList.add('active');
        }

        const prevBtn = document.querySelector('.slider-arrow.prev');
        const nextBtn = document.querySelector('.slider-arrow.next');
        
        if(nextBtn) nextBtn.addEventListener('click', () => changeSlide(1));
        if(prevBtn) prevBtn.addEventListener('click', () => changeSlide(-1));
        
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                slides[index].classList.remove('active');
                dots[index].classList.remove('active');
                index = idx;
                slides[index].classList.add('active');
                dots[index].classList.add('active');
            });
        });

        setInterval(() => changeSlide(1), 5000);
    }

    // --- XỬ LÝ MENU MOBILE ---
    const mobileMenuBtn = document.getElementById('mobile-menu');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const links = document.querySelector('.nav-links');
            if(links) {
                links.style.display = (links.style.display === 'flex') ? 'none' : 'flex';
                links.style.flexDirection = 'column';
            }
        });
    }

    // --- XỬ LÝ BẬT / TẮT POPUP GIỎ HÀNG ---
    const cartBtn = document.getElementById('cart-btn');
    const cartDropdown = document.getElementById('cart-dropdown');

    if (cartBtn && cartDropdown) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            cartDropdown.classList.toggle('show');
        });

        cartDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.addEventListener('click', () => {
            cartDropdown.classList.remove('show');
        });
    }

    // Đồng bộ và tải giao diện hiển thị dữ liệu ngay khi load trang
    updateCartData();
});

// --- PHẦN HÀM XỬ LÝ LOGIC NGHIỆP VỤ GIỎ HÀNG ---

function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

// Thêm sản phẩm
function addToCart(id, name, price, img) {
    let cart = JSON.parse(localStorage.getItem('musin_cart')) || [];
    let match = cart.find(item => item.id === id);

    if (match) {
        match.quantity += 1;
    } else {
        cart.push({ id, name, price: parseFloat(price), img, quantity: 1 });
    }

    localStorage.setItem('musin_cart', JSON.stringify(cart));
    updateCartData();

    // Tự động bật mở popup góc phải màn hình để thông báo
    const dropdown = document.getElementById('cart-dropdown');
    if (dropdown) dropdown.classList.add('show');
}

// Xóa sản phẩm
function removeProduct(id) {
    let cart = JSON.parse(localStorage.getItem('musin_cart')) || [];
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('musin_cart', JSON.stringify(cart));
    updateCartData();
}

// Cập nhật số lượng tại ô input trang giỏ hàng lớn
function updateQuantity(id, value) {
    let cart = JSON.parse(localStorage.getItem('musin_cart')) || [];
    let item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = parseInt(value);
        if (item.quantity < 1 || isNaN(item.quantity)) item.quantity = 1;
    }
    localStorage.setItem('musin_cart', JSON.stringify(cart));
    updateCartData();
}

// Hàm đồng bộ và xuất dữ liệu ra màn hình HTML
function updateCartData() {
    let cart = JSON.parse(localStorage.getItem('musin_cart')) || [];
    
    // 1. Cập nhật Badge số lượng nhỏ trên icon thanh điều hướng
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalQty = cart.reduce((acc, obj) => acc + obj.quantity, 0);
        cartCount.innerText = totalQty;
    }

    // 2. Cập nhật dữ liệu danh sách thu nhỏ bên trong Dropdown Popup
    const miniList = document.getElementById('cart-items-list');
    const totalPrice = document.getElementById('total-price');
    let sumMoney = 0;

    if (miniList) {
        if (cart.length === 0) {
            miniList.innerHTML = '<p class="empty-dropdown-msg">Bạn chưa thêm sản phẩm</p>';
            if (totalPrice) totalPrice.innerText = '0 đ';
        } else {
            let miniHtml = '';
            cart.forEach(item => {
                sumMoney += item.price * item.quantity;
                miniHtml += `
                    <div class="cart-mini-item">
                        <img src="${item.img}" class="cart-mini-img" alt="${item.name}">
                        <div class="cart-mini-info">
                            <h4 class="cart-mini-name">${item.name}</h4>
                            <p class="cart-mini-details">${item.quantity} x ${formatMoney(item.price)}</p>
                        </div>
                        <i class="fas fa-times delete-mini-item" onclick="removeProduct('${item.id}')"></i>
                    </div>
                `;
            });
            miniList.innerHTML = miniHtml;
            if (totalPrice) totalPrice.innerText = formatMoney(sumMoney);
        }
    }

    // 3. Cập nhật kết xuất cho trang lớn giỏ hàng chính (cart.html)
    const pageWrapper = document.getElementById('cart-page-wrapper');
    if (pageWrapper) {
        if (cart.length === 0) {
            pageWrapper.innerHTML = `
                <div class="empty-cart-page-state">
                    <p class="empty-page-text">Hiện bạn chưa có sản phẩm nào trong giỏ hàng.</p>
                    <a href="index.html" class="btn-continue-shopping">Tiếp tục mua hàng tại đây.</a>
                </div>
            `;
        } else {
            let tableHtml = `
                <table class="cart-large-table">
                    <thead>
                        <tr>
                            <th>SẢN PHẨM</th>
                            <th>GIÁ</th>
                            <th>SỐ LƯỢNG</th>
                            <th>TỔNG CỘNG</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            let cartTotal = 0;
            cart.forEach(item => {
                let itemTotal = item.price * item.quantity;
                cartTotal += itemTotal;
                tableHtml += `
                    <tr>
                        <td class="td-product-detail">
                            <i class="far fa-trash-alt remove-large-btn" onclick="removeProduct('${item.id}')"></i>
                            <img src="${item.img}" alt="${item.name}">
                            <span class="product-large-name">${item.name}</span>
                        </td>
                        <td>${formatMoney(item.price)}</td>
                        <td>
                            <div class="quantity-input-container">
                                <input type="number" min="1" value="${item.quantity}" onchange="updateQuantity('${item.id}', this.value)">
                            </div>
                        </td>
                        <td class="td-item-total">${formatMoney(itemTotal)}</td>
                    </tr>
                `;
            });

            tableHtml += `
                    </tbody>
                </table>
                <div class="cart-large-footer">
                    <div class="total-large-box">
                        <span class="total-label">TỔNG CỘNG:</span>
                        <span class="total-value">${formatMoney(cartTotal)}</span>
                    </div>
                    <button class="btn-submit-order" onclick="checkoutAlert()">TIẾN HÀNH ĐẶT HÀNG</button>
                </div>
            `;
            pageWrapper.innerHTML = tableHtml;
        }
    }
}

function checkoutAlert() {
    alert("Đơn hàng nhạc cụ đã được gửi thành công.");
    localStorage.removeItem('musin_cart');
    window.location.href = 'index.html';
}

function handleLogin(event) {
    event.preventDefault(); // Ngăn chặn trang bị tải lại khi submit form
    
    // Lấy dữ liệu từ 2 ô input
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;

    // Kiểm tra dữ liệu đầu vào rỗng
    if (user === "" || pass === "") {
        alert("Vui lòng điền đầy đủ tên đăng nhập và mật khẩu!");
        return;
    }

    // Lưu trạng thái đăng nhập và chuyển về trang chủ
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUser", user);
    alert("Đăng nhập thành công!");
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", function() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const currentUser = localStorage.getItem("currentUser");
    const loginLink = document.querySelector(".login-link");

    // Nếu đã đăng nhập thành công, đổi chữ "Đăng nhập" thành tên người dùng kèm nút Đăng xuất
    if (isLoggedIn === "true" && currentUser && loginLink) {
        loginLink.innerHTML = `<i class="far fa-user"></i> ${currentUser} | <span id="logout-btn" style="cursor:pointer; font-weight:600; color:#ff4d4d; margin-left:5px;">Thoát</span>`;
        
        // Gắn sự kiện Đăng xuất an toàn bằng cách kiểm tra phần tử tồn tại
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function(e) {
                e.preventDefault();
                localStorage.clear(); // Xóa sạch bộ nhớ phiên làm việc
                alert("Đã đăng xuất tài khoản!");
                window.location.href = "index.html"; // Đưa người dùng về trang chủ
            });
        }
    }
});