// Services Page Hero: Search & Content Scroll Animation
// 1. Search icon appears, glows, and zooms out to form the search bar
// 2. Query is typed out smoothly with cursor
// 3. Simulated search result cards scroll upward continuously
// 4. Seamless, elegant ambient loop with IntersectionObserver optimization

const SERVICES_DATA = [
  {
    category: 'SEO Strategy',
    url: 'munishprabhu.com › services › seo-aeo',
    title: 'SEO (Search Engine Optimization)',
    snippet: 'Rank higher on Google with on-page SEO, technical website audits, Answer Engine Optimization (AEO), and high-intent keyword strategies.',
    tags: ['Organic Growth', 'Rank #1', 'AEO / GEO']
  },
  {
    category: 'Paid Advertising',
    url: 'munishprabhu.com › services › sem-meta-ads',
    title: 'SEM & Meta Ads Campaign Optimization',
    snippet: 'Precision PPC campaigns and Meta Ads designed for peak ROI, audience retargeting, and performance marketing scalability.',
    tags: ['Meta Ads', 'Google Ads', 'High ROI']
  },
  {
    category: 'Social Media',
    url: 'munishprabhu.com › services › smm-growth',
    title: 'SMM (Social Media Marketing)',
    snippet: 'Multi-platform audience growth, engaging video/post creation, and community frameworks that convert followers into customers.',
    tags: ['Brand Reach', 'Audience Growth']
  },
  {
    category: 'Data & Analytics',
    url: 'munishprabhu.com › services › audits-analytics',
    title: 'Website Audits & Conversion Analytics',
    snippet: 'Deep website health diagnostics using Google Analytics 4, Search Console, and SEMrush for data-backed growth decisions.',
    tags: ['GA4 Insights', 'SEMrush Audits']
  },
  {
    category: 'AI Automation',
    url: 'munishprabhu.com › services › ai-marketing',
    title: 'AI Tools & Content Workflows',
    snippet: 'Streamlined generative AI prompt systems and automated research pipelines to scale content velocity and marketing impact.',
    tags: ['AI Workflows', 'Content Scale']
  }
];

function initServicesSearchAnimation() {
  const container = document.getElementById('searchHeroAnim');
  if (!container) return;

  const searchBar = container.querySelector('.search-anim-bar');
  const searchText = container.querySelector('.search-anim-query');
  const searchIcon = container.querySelector('.search-anim-center-icon');
  const metaBar = container.querySelector('.search-anim-meta');
  const scrollTrack = container.querySelector('.search-scroll-track');
  if (!searchBar || !searchText || !scrollTrack) return;

  // Build duplicate cards for seamless infinite scroll
  const renderCards = [...SERVICES_DATA, ...SERVICES_DATA];
  scrollTrack.innerHTML = renderCards.map(item => `
    <div class="search-serp-card">
      <div class="serp-card-top">
        <span class="serp-card-favicon"></span>
        <span class="serp-card-url">${item.url}</span>
      </div>
      <h4 class="serp-card-title">${item.title}</h4>
      <p class="serp-card-desc">${item.snippet}</p>
      <div class="serp-card-tags">
        ${item.tags.map(t => `<span class="serp-card-tag">${t}</span>`).join('')}
      </div>
    </div>
  `).join('');

  const SEARCH_QUERY = 'top digital marketing & seo services';
  let isAnimating = true;
  let animTimeout = null;

  function runSequence() {
    if (!isAnimating) return;

    // Reset initial state
    container.classList.remove('is-zoomed', 'is-typing', 'is-scrolling');
    container.classList.add('is-intro');
    searchText.textContent = '';
    metaBar.style.opacity = '0';
    scrollTrack.style.transform = 'translateY(0px)';

    // Step 1: Search icon appears & pulses
    animTimeout = setTimeout(() => {
      if (!isAnimating) return;
      // Step 2: Search icon zooms out into search bar
      container.classList.remove('is-intro');
      container.classList.add('is-zoomed');

      // Step 3: Type out query character by character
      let charIdx = 0;
      animTimeout = setTimeout(() => {
        if (!isAnimating) return;
        container.classList.add('is-typing');
        const typeInterval = setInterval(() => {
          if (!isAnimating) {
            clearInterval(typeInterval);
            return;
          }
          if (charIdx < SEARCH_QUERY.length) {
            searchText.textContent += SEARCH_QUERY[charIdx];
            charIdx++;
          } else {
            clearInterval(typeInterval);
            // Query finished typing, show results meta
            container.classList.remove('is-typing');
            metaBar.style.opacity = '1';

            // Step 4: Scroll results feed
            animTimeout = setTimeout(() => {
              if (!isAnimating) return;
              container.classList.add('is-scrolling');

              // After smooth scroll cycle completes, pause and restart
              animTimeout = setTimeout(() => {
                if (!isAnimating) return;

                // Signal that the search animation sequence has completed presentation!
                window.dispatchEvent(new CustomEvent('searchAnimationComplete'));

                // Fade out gently before loop restart
                container.style.opacity = '0';
                animTimeout = setTimeout(() => {
                  container.style.opacity = '1';
                  runSequence();
                }, 320);
              }, 5600); // Duration of scroll viewing (5.6s)
            }, 320);
          }
        }, 18); // Fast, responsive typing speed (18ms/char)
      }, 260);
    }, 420);
  }

  runSequence();

  // IntersectionObserver: Pause animation when off-screen to save battery
  const observer = new IntersectionObserver(([entry]) => {
    isAnimating = entry.isIntersecting;
    if (isAnimating) {
      clearTimeout(animTimeout);
      runSequence();
    } else {
      clearTimeout(animTimeout);
    }
  }, { threshold: 0.1 });
  observer.observe(container);

  // Tab visibility handling
  document.addEventListener('visibilitychange', () => {
    isAnimating = !document.hidden;
    if (isAnimating) {
      clearTimeout(animTimeout);
      runSequence();
    } else {
      clearTimeout(animTimeout);
    }
  });
}

window.initServicesSearchAnimation = initServicesSearchAnimation;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initServicesSearchAnimation);
} else {
  initServicesSearchAnimation();
}
