/* Hero carousel: auto-advancing image/gradient banner */
document.addEventListener('DOMContentLoaded', function(){
	const slides = document.querySelectorAll('.hero-slide');
	const dots = document.querySelectorAll('.hero-dot');
	if(!slides.length) return;

	let index = 0;
	let timer = null;
	const INTERVAL = 5000;

	function show(i){
		slides.forEach(function(s, si){ s.classList.toggle('is-active', si === i); });
		dots.forEach(function(d, di){ d.classList.toggle('is-active', di === i); });
		index = i;
	}
	function next(){ show((index + 1) % slides.length); }

	function start(){
		stop();
		timer = setInterval(next, INTERVAL);
	}
	function stop(){
		if(timer) clearInterval(timer);
	}

	dots.forEach(function(dot, i){
		dot.addEventListener('click', function(){
			show(i);
			start();
		});
	});

	const hero = document.querySelector('.hero');
	if(hero){
		hero.addEventListener('mouseenter', stop);
		hero.addEventListener('mouseleave', start);
	}

	show(0);
	start();
});
