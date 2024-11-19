import { Injectable } from '@angular/core';
import { FaqItem, TopicItem } from '../interface/chat.interface';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private topics: TopicItem[] = [
    {
      title: 'Cuenta y Seguridad',
      icon: '🔒',
      keywords: ['contraseña', 'clave', 'seguridad', 'usuario', 'personal', 'sospechosa', '2fa', 'autenticación'],
      faqs: [
        {
          question: '¿Cómo cambio mi contraseña?',
          answer: 'Para cambiar su contraseña, vaya a la sección "Perfil" y seleccione la opción "Cambiar contraseña".'
        },
        {
          question: '¿Qué hago si olvidé mi usuario o contraseña?',
          answer: 'En la página de LogIn, haga clic en "¿Olvidó su contraseña?" y siga los pasos de recuperación.'
        },
        {
          question: '¿Cómo actualizo mi información personal (email, teléfono, etc.)?',
          answer: 'Acceda a su perfil, seleccione "Ver perfil" y apriete en  "Modificar perfil" para actualizar sus datos.'
        },
        {
          question: '¿Qué debo hacer si detecto actividad sospechosa en mi cuenta?',
          answer: 'Contacte inmediatamente a nuestro numero 2235123456 y reporte la actividad sospechosa.'
        }
      ]
    },
    {
      title: 'Transferencias y Pagos',
      icon: '💸',
      keywords: ['transferencia', 'pago', 'límite', 'servicio', 'programar', 'futura'],
      faqs: [
        {
          question: '¿Cómo realizo una transferencia a otra cuenta?',
          answer: 'Vaya a la sección "Transferencias", seleccione la opcion "Transferir", luego ingrese el alias o cbu y el monto a transferir.'
        },
        {
          question: '¿Qué hago si una transferencia no se procesó correctamente?',
          answer: 'Contacte a soporte técnico con el número de operación para resolver el inconveniente.'
        },
        {
          question: '¿Donde puedo ver mis transferencias realizadas?',
          answer: 'Vaya a la sección "Transferencias", seleccione la opción "Ver mis transferencias"'
        },
        {
          question: '¿Como puedo descargar el comprobante de la transferencia?',
          answer: 'Vaya a la sección "Mis transferencias", seleccione "Ver comprobante" y luego "Descargar PDF"'
        }
      ]
    },
    {
      title: 'Tarjetas y Préstamos',
      icon: '💳',
      keywords: ['tarjeta', 'crédito', 'débito', 'préstamo', 'robo', 'perdida', 'resumen'],
      faqs: [
        {
          question: '¿Cómo solicito una tarjeta de crédito o débito?',
          answer: 'Acceda a "Tarjetas" y seleccione "Solicitar nueva tarjeta".'
        },
        {
          question: '¿Cómo reporto una tarjeta perdida o robada?',
          answer: 'Llame inmediatamente a nuestra línea de atención 24/7 o use la opción "Dar de baja tarjeta".'
        },
        {
          question: '¿Cómo consulto el estado de mis pagos de préstamo?',
          answer: 'En "Préstamos", seleccione "Ver mis prestamos"  para ver el estado de los pagos.'
        }
      ]
    },
    {
      title: 'Consultas de Saldo y Movimientos',
      icon: '📊',
      keywords: ['saldo', 'movimiento', 'extracto', 'estado', 'cuenta', 'historial'],
      faqs: [
        {
          question: '¿Cómo consulto el saldo de mi cuenta?',
          answer: 'El saldo se muestra en la página principal o en la sección "Mis cuentas".'
        },
        {
          question: '¿Cómo veo el historial de mis movimientos bancarios?',
          answer: 'En "Transferencias", seleccione su cuenta y luego "Ver transferencias".'
        }
      ]
    },
    {
      title: 'Otros Servicios y Ayuda',
      icon: '❓',
      keywords: ['ayuda', 'soporte', 'cajero', 'sucursal', 'contacto', 'horario'],
      faqs: [
        {
          question: '¿Cómo abro una nueva cuenta?',
          answer: 'Vaya a "Cuentas" y seleccione "Solicitar cuenta".'
        },
        {
          question: '¿Dónde encuentro los cajeros automáticos más cercanos?',
          answer: 'Use la opción "Localizar cajeros" en el menú principal para ver el mapa.'
        },
        {
          question: '¿Cómo contacto al servicio de atención al cliente?',
          answer: 'Puede llamar al 2235123456 las 24hs.'
        },
        {
          question: '¿Cuáles son los horarios de atención de soporte?',
          answer: 'El soporte está disponible 24/7 para emergencias y de 8:00 a 20:00 para consultas generales.'
        }
      ]
    }
  ];

  getTopics(): TopicItem[] {
    return this.topics;
  }

  getFaqsByTopic(topicTitle: string): FaqItem[] {
    const topic = this.topics.find(t => t.title === topicTitle);
    return topic ? topic.faqs : [];
  }

  findTopicByKeyword(keyword: string): TopicItem | null {
    const normalizedKeyword = keyword.toLowerCase().trim();
    return this.topics.find(topic => 
      topic.keywords.some(k => normalizedKeyword.includes(k)) ||
      topic.title.toLowerCase().includes(normalizedKeyword)
    ) || null;
  }

  findAnswer(question: string): string {
    for (const topic of this.topics) {
      const faq = topic.faqs.find(f => 
        f.question.toLowerCase() === question.toLowerCase()
      );
      if (faq) {
        return faq.answer;
      }
    }

    const matchingTopic = this.findTopicByKeyword(question);
    if (matchingTopic) {
      return `Parece que estás preguntando sobre ${matchingTopic.title}. Aquí tienes algunas preguntas frecuentes sobre este tema:`;
    }

    return 'Por favor, seleccione una de las preguntas disponibles en el menú o intente reformular su pregunta.';
  }
}