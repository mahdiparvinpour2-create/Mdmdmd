/* =========================================================
   لوکس رویال — Demo Casino
   Demo-only account system.
   Everything lives in the browser's localStorage. There is no
   server, no real money, and no real password security here —
   this exists purely so the demo balance can persist between
   visits on the same browser.
   ========================================================= */
(function(){
	const USERS_KEY = 'demoCasinoUsers';
	const SESSION_KEY = 'demoCasinoSession';
	const STARTING_BALANCE = 10000;

	function getUsers(){
		try{ return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
		catch(e){ return {}; }
	}
	function saveUsers(users){
		localStorage.setItem(USERS_KEY, JSON.stringify(users));
	}
	function getSession(){
		return localStorage.getItem(SESSION_KEY);
	}
	function setSession(username){
		if(username){ localStorage.setItem(SESSION_KEY, username); }
		else{ localStorage.removeItem(SESSION_KEY); }
	}

	function register(username, password){
		username = (username || '').trim();
		if(username.length < 3){
			return { ok:false, message:'نام کاربری باید حداقل ۳ کاراکتر باشد.' };
		}
		if(!password || password.length < 4){
			return { ok:false, message:'رمز عبور باید حداقل ۴ کاراکتر باشد.' };
		}
		const users = getUsers();
		if(users[username]){
			return { ok:false, message:'این نام کاربری قبلاً ثبت شده است.' };
		}
		users[username] = { password: password, balance: STARTING_BALANCE };
		saveUsers(users);
		setSession(username);
		return { ok:true };
	}

	function login(username, password){
		username = (username || '').trim();
		const users = getUsers();
		const user = users[username];
		if(!user || user.password !== password){
			return { ok:false, message:'نام کاربری یا رمز عبور اشتباه است.' };
		}
		setSession(username);
		return { ok:true };
	}

	function logout(){
		setSession(null);
	}

	function currentUser(){
		const session = getSession();
		if(!session) return null;
		const users = getUsers();
		if(!users[session]) return null;
		return { username: session, balance: users[session].balance };
	}

	window.DemoCasinoAuth = { register, login, logout, currentUser, STARTING_BALANCE };
})();

/* =========================================================
   Header rendering + modal wiring — shared across pages
   ========================================================= */
document.addEventListener('DOMContentLoaded', function(){
	const auth = window.DemoCasinoAuth;
	const headerActions = document.getElementById('headerActions');
	const overlay = document.getElementById('authOverlay');
	const modalTitle = document.getElementById('authTitle');
	const modalSub = document.getElementById('authSub');
	const loginForm = document.getElementById('loginForm');
	const registerForm = document.getElementById('registerForm');
	const formMsg = document.getElementById('authMsg');
	const switchLine = document.getElementById('authSwitch');

	let mode = 'login';

	function renderHeader(){
		if(!headerActions) return;
		const user = auth.currentUser();
		if(user){
			headerActions.innerHTML =
				'<div class="user-chip">' +
					'<span class="avatar">' + user.username.charAt(0).toUpperCase() + '</span>' +
					'<span>' + user.username + ' &middot; <span class="balance">' + user.balance.toLocaleString('en-GB') + ' سکه</span></span>' +
				'</div>' +
				'<button class="btn btn-ghost btn-sm" id="logoutBtn">خروج</button>';
			document.getElementById('logoutBtn').onclick = function(){
				auth.logout();
				renderHeader();
				if(document.body.dataset.page === 'roulette'){ location.reload(); }
			};
		} else {
			headerActions.innerHTML =
				'<button class="btn btn-ghost btn-sm" id="openLogin">ورود</button>' +
				'<button class="btn btn-gold btn-sm" id="openRegister">ثبت‌نام</button>';
			document.getElementById('openLogin').onclick = function(){ openModal('login'); };
			document.getElementById('openRegister').onclick = function(){ openModal('register'); };
		}
	}

	function openModal(which){
		if(!overlay) return;
		mode = which;
		formMsg.textContent = '';
		formMsg.className = 'form-msg';
		loginForm.style.display = which === 'login' ? 'block' : 'none';
		registerForm.style.display = which === 'register' ? 'block' : 'none';
		if(which === 'login'){
			modalTitle.textContent = 'ورود به حساب دمو';
			modalSub.textContent = 'برای ادامه بازی با موجودی ذخیره‌شده خود وارد شوید.';
			switchLine.innerHTML = 'حساب ندارید؟ <button type="button" id="toRegister">ثبت‌نام کنید</button>';
		} else {
			modalTitle.textContent = 'ساخت حساب دمو';
			modalSub.textContent = 'ثبت‌نام رایگان و آنی — ' + auth.STARTING_BALANCE.toLocaleString('en-GB') + ' سکه دمو هدیه بگیرید.';
			switchLine.innerHTML = 'قبلاً ثبت‌نام کرده‌اید؟ <button type="button" id="toLogin">وارد شوید</button>';
		}
		overlay.classList.add('is-open');
		const toReg = document.getElementById('toRegister');
		if(toReg) toReg.onclick = function(){ openModal('register'); };
		const toLog = document.getElementById('toLogin');
		if(toLog) toLog.onclick = function(){ openModal('login'); };
	}
	function closeModal(){
		overlay.classList.remove('is-open');
	}

	window.DemoCasinoUI = { openModal, closeModal, renderHeader };

	if(overlay){
		overlay.addEventListener('click', function(e){
			if(e.target === overlay) closeModal();
		});
		document.getElementById('authCloseBtn').onclick = closeModal;

		loginForm.addEventListener('submit', function(e){
			e.preventDefault();
			const u = document.getElementById('loginUsername').value;
			const p = document.getElementById('loginPassword').value;
			const res = auth.login(u, p);
			if(res.ok){
				formMsg.textContent = 'ورود موفق بود!';
				formMsg.className = 'form-msg is-ok';
				renderHeader();
				setTimeout(function(){
					closeModal();
					if(document.body.dataset.page === 'roulette'){ location.reload(); }
				}, 500);
			} else {
				formMsg.textContent = res.message;
				formMsg.className = 'form-msg';
			}
		});

		registerForm.addEventListener('submit', function(e){
			e.preventDefault();
			const u = document.getElementById('registerUsername').value;
			const p = document.getElementById('registerPassword').value;
			const res = auth.register(u, p);
			if(res.ok){
				formMsg.textContent = 'ثبت‌نام موفق بود! خوش آمدید.';
				formMsg.className = 'form-msg is-ok';
				renderHeader();
				setTimeout(function(){
					closeModal();
					if(document.body.dataset.page === 'roulette'){ location.reload(); }
				}, 500);
			} else {
				formMsg.textContent = res.message;
				formMsg.className = 'form-msg';
			}
		});
	}

	renderHeader();

	document.querySelectorAll('[data-open-auth]').forEach(function(btn){
		btn.addEventListener('click', function(){
			openModal(btn.getAttribute('data-open-auth') || 'login');
		});
	});
});
