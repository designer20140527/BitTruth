// 初始化Lenis平滑滚动
let lenis;

// 在DOM加载完成后初始化Lenis
document.addEventListener('DOMContentLoaded', function() {
    // 初始化Lenis
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // 将Lenis与RAF(requestAnimationFrame)连接
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 当页面滚动时，导航栏跟随滚动
    let isNavFixed = false;
    let navTransitionInProgress = false;

    lenis.on('scroll', function(e) {
        const navWrapper = document.getElementById('navWrapper');
        const scrollPosition = e.animatedScroll;
        
        // 避免在过渡期间触发新的过渡
        if (navTransitionInProgress) return;
        
        if (scrollPosition > 100 && !isNavFixed) {
            // 准备切换到固定状态
            navTransitionInProgress = true;
            
            // 先淡出
            navWrapper.style.opacity = '0';
            
            // 等待淡出完成
            setTimeout(() => {
                // 添加固定类
                navWrapper.classList.add('nav-fixed');
                
                // 强制重绘以确保过渡效果
                void navWrapper.offsetWidth;
                
                // 淡入
                navWrapper.style.opacity = '1';
                
                isNavFixed = true;
                
                // 过渡结束后重置标志
                setTimeout(() => {
                    navTransitionInProgress = false;
                }, 300);
            }, 300);
            
        } else if (scrollPosition <= 100 && isNavFixed) {
            // 准备切换回正常状态
            navTransitionInProgress = true;
            
            // 先淡出
            navWrapper.style.opacity = '0';
            
            // 等待淡出完成
            setTimeout(() => {
                // 移除固定类
                navWrapper.classList.remove('nav-fixed');
                
                // 强制重绘以确保过渡效果
                void navWrapper.offsetWidth;
                
                // 淡入
                navWrapper.style.opacity = '1';
                
                isNavFixed = false;
                
                // 过渡结束后重置标志
                setTimeout(() => {
                    navTransitionInProgress = false;
                }, 300);
            }, 300);
        }
    });

    // 滚动动画效果
    const featuresSection = document.querySelector('.features');
    const featuresIntro = document.querySelector('.features-intro');
    const firstCard = document.querySelector('.feature-card:first-child');
    const secondCard = document.querySelector('.feature-card:last-child');
    const featuresCards = document.querySelector('.features-cards');
    
    if (!featuresSection || !featuresIntro || !firstCard || !secondCard || !featuresCards) return;
    
    // 获取元素初始位置
    let featuresTop;
    let cardsBottom;
    
    // 计算位置和距离
    function calculatePositions() {
        featuresTop = featuresSection.getBoundingClientRect().top + window.scrollY;
        cardsBottom = featuresCards.getBoundingClientRect().height - firstCard.getBoundingClientRect().height;
    }
    
    // 初始计算
    window.addEventListener('load', calculatePositions);
    window.addEventListener('resize', calculatePositions);
    
    // 在DOM加载完成后执行
    window.addEventListener('load', function() {
        // 重置任何可能的变换，确保准确测量
        featuresIntro.style.transform = 'translateY(0)';
        
        // 获取第一个卡片的顶部位置
        const cardTop = firstCard.getBoundingClientRect().top;
        const introTop = featuresIntro.getBoundingClientRect().top;
        
        // 计算需要调整的距离
        const adjustment = cardTop - introTop;
        
        // 应用调整
        if (adjustment !== 0) {
            featuresIntro.style.transform = `translateY(${adjustment}px)`;
            
            // 保存原始调整值，以便滚动动画可以在此基础上进行
            featuresIntro.dataset.initialOffset = adjustment;
        }
    });
    
    // 使用Lenis的滚动事件
    lenis.on('scroll', function(e) {
        const scrollPosition = e.animatedScroll;
        
        // 提前触发动画，在元素进入视口前就开始
        const relativeScroll = scrollPosition - featuresTop + window.innerHeight * 0.1;
        
        // 确保我们有正确的位置计算
        if (!featuresTop) calculatePositions();
        
        // 当滚动到features部分前就开始动画
        if (relativeScroll > 0) {
            // 计算第一个卡片应该移动的距离
            const moveDistance = Math.min(relativeScroll, cardsBottom);
            
            // 获取初始偏移量（如果有）
            const initialOffset = parseFloat(featuresIntro.dataset.initialOffset || 0);
            
            // 应用变换，考虑初始偏移量
            firstCard.style.transform = `translateY(${moveDistance}px)`;
            featuresIntro.style.transform = `translateY(${initialOffset + moveDistance}px)`;
        } else {
            // 重置变换，但保留初始偏移量
            firstCard.style.transform = 'translateY(0)';
            featuresIntro.style.transform = `translateY(${featuresIntro.dataset.initialOffset || 0}px)`;
        }
    });

    // FAQ Accordion 功能
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // 关闭所有其他项
            accordionItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // 切换当前项的状态
            item.classList.toggle('active');
            
            // 使用Lenis平滑滚动到展开的内容
            if (!isActive) {
                setTimeout(() => {
                    lenis.scrollTo(item, {
                        offset: -100,
                        duration: 1,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                    });
                }, 300);
            }
        });
    });

    // 全局水波纹效果
    // 创建水波纹容器并添加到body
    const rippleContainer = document.createElement('div');
    rippleContainer.className = 'ripple-container';
    document.body.appendChild(rippleContainer);
    
    // 监听整个文档的鼠标移动
    document.addEventListener('mousemove', function(e) {
        // 降低创建频率，使效果更优雅
        if (!document.lastRippleTime || Date.now() - document.lastRippleTime > 300) { // 增加间隔时间
            document.lastRippleTime = Date.now();
            
            // 获取鼠标在视口中的位置
            const x = e.clientX;
            const y = e.clientY;
            
            // 创建水波纹元素
            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            // 添加到容器
            rippleContainer.appendChild(ripple);
            
            // 动画结束后移除元素
            setTimeout(() => {
                ripple.remove();
            }, 3000); // 与动画时间匹配
        }
    });
    
    // 限制同时存在的水波纹数量
    setInterval(() => {
        const ripples = rippleContainer.querySelectorAll('.ripple');
        if (ripples.length > 15) { // 减少最大数量
            ripples[0].remove();
        }
    }, 300);

    // 监听滚动，更新导航active状态
    const sections = ['top', 'about', 'tokenomics', 'roadmap'];
    const navItems = document.querySelectorAll('.nav-item');
    
    function setActiveNav() {
        const scrollPosition = window.scrollY + 200; // 增加偏移量，提前激活
        
        // 从最后一个部分开始检查，优先匹配最下方的部分
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            const target = document.getElementById(section);
            if (!target) continue;
            
            const sectionTop = target.offsetTop - 150;
            
            if (scrollPosition >= sectionTop) {
                navItems.forEach(item => item.classList.remove('active'));
                navItems[i].classList.add('active');
                break; // 找到匹配的部分后立即退出循环
            }
        }
    }
    
    window.addEventListener('scroll', setActiveNav);
    setActiveNav(); // 初始化
});

// 添加平滑滚动到锚点链接
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            lenis.scrollTo(targetElement, {
                offset: 0,
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        }
    });
}); 