    // Inicializar iconos Lucide
    lucide.createIcons();

    // ===== DETECCIÓN DE DISPOSITIVO =====
    function detectMobile() {
      return window.innerWidth <= 768;
    }

    // ===== VARIABLES GLOBALES =====
    const viewToggle = document.getElementById('view-toggle');
    const viewIcon = document.getElementById('view-icon');
    const viewText = document.getElementById('view-text');
    const desktopView = document.querySelector('.desktop-view');
    const mobileView = document.querySelector('.mobile-view');
    const mobileFilter = document.getElementById('mobile-filter');

    // ===== TOGGLE ENTRE VISTA TABLA Y TARJETAS =====
    function toggleView() {
      const isMobileView = mobileView.style.display === 'block' || 
                          (mobileView.style.display === '' && detectMobile());
      
      if (isMobileView) {
        // Cambiar a vista tabla
        mobileView.style.display = 'none';
        desktopView.style.display = 'block';
        viewIcon.setAttribute('data-lucide', 'layout-grid');
        viewText.textContent = 'Vista tarjetas';
      } else {
        // Cambiar a vista tarjetas
        desktopView.style.display = 'none';
        mobileView.style.display = 'block';
        viewIcon.setAttribute('data-lucide', 'table');
        viewText.textContent = 'Vista tabla';
      }
      lucide.createIcons();
    }

    // ===== FILTRADO POR PRIORIDAD CRÍTICA =====
    function filterByCritical() {
      if (mobileFilter) {
        mobileFilter.value = 'alta';
        mobileFilter.dispatchEvent(new Event('change'));
      }
      
      // También activar el botón correspondiente
      const altaBtn = document.querySelector('.filter-btn[data-filter="alta"]');
      if (altaBtn) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        altaBtn.classList.add('active');
      }
    }

    // ===== FILTRADO PARA AMBAS VISTAS =====
    function applyFilter(filter) {
      // Filtrar tabla
      document.querySelectorAll('.reporte-row').forEach(row => {
        const prioridad = row.dataset.prioridad;
        const estado = row.dataset.estado;
        
        if (filter === 'all') {
          row.style.display = '';
        } else if (filter === 'alta') {
          row.style.display = prioridad === 'alta' ? '' : 'none';
        } else if (filter === 'media') {
          row.style.display = prioridad === 'media' ? '' : 'none';
        } else if (filter === 'baja') {
          row.style.display = prioridad === 'baja' ? '' : 'none';
        } else if (filter === 'pendiente') {
          row.style.display = estado === 'pendiente' ? '' : 'none';
        } else if (filter === 'resuelto') {
          row.style.display = estado === 'resuelto' ? '' : 'none';
        }
      });
      
      // Filtrar tarjetas
      document.querySelectorAll('.reporte-card').forEach(card => {
        const prioridad = card.dataset.prioridad;
        const estado = card.dataset.estado;
        
        if (filter === 'all') {
          card.style.display = '';
        } else if (filter === 'alta') {
          card.style.display = prioridad === 'alta' ? '' : 'none';
        } else if (filter === 'media') {
          card.style.display = prioridad === 'media' ? '' : 'none';
        } else if (filter === 'baja') {
          card.style.display = prioridad === 'baja' ? '' : 'none';
        } else if (filter === 'pendiente') {
          card.style.display = estado === 'pendiente' ? '' : 'none';
        } else if (filter === 'resuelto') {
          card.style.display = estado === 'resuelto' ? '' : 'none';
        }
      });
    }

    // ===== DESTACAR ELEMENTOS CRÍTICOS =====
    function highlightCriticalItems() {
      document.querySelectorAll('.reporte-row[data-prioridad="alta"]').forEach(row => {
        row.style.backgroundColor = 'rgba(220, 38, 38, 0.02)';
      });
      
      document.querySelectorAll('.reporte-card[data-prioridad="alta"]').forEach(card => {
        card.style.borderLeft = '3px solid #dc2626';
      });
    }

    // ===== INICIALIZAR VISTA SEGÚN DISPOSITIVO =====
    function initView() {
      if (detectMobile()) {
        desktopView.style.display = 'none';
        mobileView.style.display = 'block';
        viewIcon.setAttribute('data-lucide', 'table');
        viewText.textContent = 'Vista tabla';
      } else {
        desktopView.style.display = 'block';
        mobileView.style.display = 'none';
        viewIcon.setAttribute('data-lucide', 'layout-grid');
        viewText.textContent = 'Vista tarjetas';
      }
      lucide.createIcons();
    }

    // ===== EVENT LISTENERS =====
    function setupEventListeners() {
      // Toggle de vista
      if (viewToggle) {
        viewToggle.addEventListener('click', toggleView);
      }
      
      // Filtrado con select
      if (mobileFilter) {
        mobileFilter.addEventListener('change', function(e) {
          applyFilter(e.target.value);
        });
      }
      
      // Filtrado con botones
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const filter = this.dataset.filter;
          
          // Actualizar botones activos
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          
          // Actualizar select y aplicar filtro
          if (mobileFilter) {
            mobileFilter.value = filter;
          }
          applyFilter(filter);
        });
      });
    }

    // ===== INICIALIZACIÓN COMPLETA =====
    function initAdminPanel() {
      console.log('🚀 Inicializando Panel de Administración...');
      
      initView();
      setupEventListeners();
      highlightCriticalItems();
      
      console.log('✅ Panel de Administración inicializado');
    }

    // ===== EVENTO DE REDIMENSIONAMIENTO =====
    window.addEventListener('resize', function() {
      clearTimeout(window.resizeTimer);
      window.resizeTimer = setTimeout(() => {
        initView();
      }, 250);
    });

    // ===== EJECUCIÓN AL CARGAR =====
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initAdminPanel, 100);
    });