import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface Testimonial {
  id: number;
  name: string;
  position: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
}

interface Statistic {
  id: number;
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  // Navigation
  isMenuOpen: boolean = false;
  isScrolled: boolean = false;
  
  // Hero Section
  heroTitle: string = 'Finantial Capital';
  heroSubtitle: string = 'Plataforma de Contabilidad Moderna';
  heroDescription: string = 'Gestiona tu empresa con la herramienta más avanzada de contabilidad. Automatiza procesos, genera reportes y toma decisiones informadas.';
  
  // Features
  features: Feature[] = [
    {
      id: 1,
      icon: 'fas fa-chart-line',
      title: 'Análisis Financiero',
      description: 'Obtén insights detallados sobre el rendimiento de tu empresa con gráficos interactivos y reportes personalizados.',
      color: '#007bff'
    },
    {
      id: 2,
      icon: 'fas fa-users',
      title: 'Gestión de Empleados',
      description: 'Administra tu personal de manera eficiente con herramientas de nómina, horarios y evaluación de desempeño.',
      color: '#28a745'
    },
    {
      id: 3,
      icon: 'fas fa-calculator',
      title: 'Calculadoras Avanzadas',
      description: 'Calcula impuestos, depreciación, amortización y más con nuestras herramientas especializadas.',
      color: '#ffc107'
    },
    {
      id: 4,
      icon: 'fas fa-file-invoice-dollar',
      title: 'Facturación Automática',
      description: 'Genera facturas profesionales automáticamente y gestiona el flujo de caja de tu empresa.',
      color: '#dc3545'
    },
    {
      id: 5,
      icon: 'fas fa-shield-alt',
      title: 'Seguridad Avanzada',
      description: 'Tus datos están protegidos con encriptación de nivel bancario y respaldos automáticos.',
      color: '#6f42c1'
    },
    {
      id: 6,
      icon: 'fas fa-mobile-alt',
      title: 'Acceso Móvil',
      description: 'Accede a tu información desde cualquier dispositivo con nuestra aplicación móvil responsive.',
      color: '#fd7e14'
    }
  ];
  
  // Statistics
  statistics: Statistic[] = [
    {
      id: 1,
      value: '500+',
      label: 'Empresas Confían',
      icon: 'fas fa-building'
    },
    {
      id: 2,
      value: '10,000+',
      label: 'Transacciones Diarias',
      icon: 'fas fa-exchange-alt'
    },
    {
      id: 3,
      value: '99.9%',
      label: 'Tiempo Activo',
      icon: 'fas fa-clock'
    },
    {
      id: 4,
      value: '24/7',
      label: 'Soporte Técnico',
      icon: 'fas fa-headset'
    }
  ];
  
  // Testimonials
  testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'María González',
      position: 'CEO',
      company: 'TechStart Solutions',
      content: 'Financial Capital transformó completamente la gestión financiera de nuestra empresa. Los reportes automáticos nos ahorran horas de trabajo semanal.',
      avatar: 'assets/avatar1.jpg',
      rating: 5
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      position: 'Contador Senior',
      company: 'Consultoría ABC',
      content: 'La interfaz es intuitiva y las funcionalidades son muy completas. Recomiendo esta plataforma a todas las empresas que buscan eficiencia.',
      avatar: 'assets/avatar2.jpg',
      rating: 5
    },
    {
      id: 3,
      name: 'Ana Martínez',
      position: 'Directora Financiera',
      company: 'Innovación Digital',
      content: 'Excelente herramienta para el control financiero. Los dashboards nos permiten tomar decisiones más informadas y rápidas.',
      avatar: 'assets/avatar3.jpg',
      rating: 5
    }
  ];
  
  // Pricing
  pricingPlans = [
    {
      name: 'Básico',
      price: '$29',
      period: 'mes',
      features: [
        'Hasta 5 usuarios',
        'Reportes básicos',
        'Soporte por email',
        'Backup automático',
        'Acceso móvil'
      ],
      popular: false,
      color: '#007bff'
    },
    {
      name: 'Profesional',
      price: '$79',
      period: 'mes',
      features: [
        'Hasta 20 usuarios',
        'Reportes avanzados',
        'Soporte prioritario',
        'Integración API',
        'Análisis predictivo',
        'Personalización completa'
      ],
      popular: true,
      color: '#28a745'
    },
    {
      name: 'Empresarial',
      price: '$199',
      period: 'mes',
      features: [
        'Usuarios ilimitados',
        'Reportes personalizados',
        'Soporte 24/7',
        'Integración completa',
        'AI y Machine Learning',
        'Consultoría incluida'
      ],
      popular: false,
      color: '#6f42c1'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.handleScroll();
    this.handleMenuClickOutside();
  }

  handleScroll(): void {
    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 50;
    });
  }

  handleMenuClickOutside(): void {
    document.addEventListener('click', (event) => {
      const navMenu = document.querySelector('.nav-menu');
      const navToggle = document.querySelector('.nav-toggle');
      
      if (this.isMenuOpen && navMenu && navToggle) {
        const target = event.target as Element;
        if (!navMenu.contains(target) && !navToggle.contains(target)) {
          this.closeMenu();
        }
      }
    });
  }

  toggleMenu(): void {
    console.log('Toggle menu clicked, current state:', this.isMenuOpen);
    this.isMenuOpen = !this.isMenuOpen;
    console.log('New state:', this.isMenuOpen);
    // Prevenir scroll del body cuando el menú móvil está abierto
    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    // Asegurar que el body no tenga overflow hidden si estaba activo
    document.body.style.overflow = '';
  }

  scrollToSection(sectionId: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Offset para el navbar fijo
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    this.closeMenu();
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/login']);
  }

  getStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  getFeatureColor(color: string): string {
    return color;
  }

  getPricingColor(color: string): string {
    return color;
  }

  // Animation triggers
  onIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }

  // Contact form
  contactForm = {
    name: '',
    email: '',
    company: '',
    message: ''
  };

  submitContact(): void {
    // Simular envío de formulario
    console.log('Formulario de contacto enviado:', this.contactForm);
    alert('¡Gracias por tu mensaje! Te contactaremos pronto.');
    this.contactForm = { name: '', email: '', company: '', message: '' };
  }

  // Newsletter
  newsletterEmail: string = '';

  subscribeNewsletter(): void {
    if (this.newsletterEmail) {
      console.log('Suscripción a newsletter:', this.newsletterEmail);
      alert('¡Gracias por suscribirte a nuestro newsletter!');
      this.newsletterEmail = '';
    }
  }
}
