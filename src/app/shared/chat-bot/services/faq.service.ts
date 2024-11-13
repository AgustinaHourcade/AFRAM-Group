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
          answer: 'Para cambiar su contraseña, vaya a la sección de Seguridad en su perfil y seleccione la opción "Cambiar contraseña".'
        },
        {
          question: '¿Qué hago si olvidé mi usuario o contraseña?',
          answer: 'En la página de inicio, haga clic en "¿Olvidó su contraseña?" y siga los pasos de recuperación.'
        },
        {
          question: '¿Cómo actualizo mi información personal (email, teléfono, etc.)?',
          answer: 'Acceda a su perfil y seleccione "Actualizar información personal" para modificar sus datos.'
        },
        {
          question: '¿Qué debo hacer si detecto actividad sospechosa en mi cuenta?',
          answer: 'Contacte inmediatamente a nuestro servicio de atención al cliente y reporte la actividad sospechosa.'
        },
        {
          question: '¿Cómo configuro la autenticación de dos factores (2FA)?',
          answer: 'En la sección de Seguridad, encontrará la opción para activar la autenticación de dos factores.'
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
          answer: 'Vaya a la sección "Transferencias", seleccione la cuenta destino y el monto a transferir.'
        },
        {
          question: '¿Cuál es el límite diario para transferencias?',
          answer: 'El límite diario depende de su tipo de cuenta. Puede consultarlo en "Configuración > Límites".'
        },
        {
          question: '¿Cómo programo una transferencia para una fecha futura?',
          answer: 'Al realizar una transferencia, seleccione "Programar transferencia" y elija la fecha deseada.'
        },
        {
          question: '¿Cómo puedo pagar mis servicios desde el home banking?',
          answer: 'En la sección "Pagos", seleccione el servicio a pagar e ingrese el código de pago.'
        },
        {
          question: '¿Qué hago si una transferencia no se procesó correctamente?',
          answer: 'Contacte a soporte técnico con el número de operación para resolver el inconveniente.'
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
          answer: 'Acceda a "Productos > Tarjetas" y seleccione "Solicitar nueva tarjeta".'
        },
        {
          question: '¿Cómo reporto una tarjeta perdida o robada?',
          answer: 'Llame inmediatamente a nuestra línea de atención 24/7 o use la opción "Bloquear tarjeta".'
        },
        {
          question: '¿Cómo veo el resumen de mi tarjeta de crédito?',
          answer: 'En la sección "Tarjetas", seleccione su tarjeta y luego "Ver resumen".'
        },
        {
          question: '¿Cuáles son los requisitos para solicitar un préstamo?',
          answer: 'Los requisitos varían según el tipo de préstamo. Consulte la sección "Préstamos > Requisitos".'
        },
        {
          question: '¿Cómo consulto el estado de mis pagos de préstamo?',
          answer: 'En "Préstamos", seleccione su préstamo activo para ver el estado de los pagos.'
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
          answer: 'El saldo se muestra en la página principal o en la sección "Cuentas".'
        },
        {
          question: '¿Cómo veo el historial de mis movimientos bancarios?',
          answer: 'En "Cuentas", seleccione su cuenta y luego "Ver movimientos".'
        },
        {
          question: '¿Qué significa el concepto que aparece en mi extracto?',
          answer: 'Los conceptos describen el tipo de operación realizada. Puede ver el detalle seleccionando el movimiento.'
        },
        {
          question: '¿Cómo descargo mi estado de cuenta mensual?',
          answer: 'En la sección "Cuentas", seleccione "Descargar estado de cuenta" y elija el mes.'
        }
      ]
    },
    {
      title: 'Configuración de Notificaciones',
      icon: '🔔',
      keywords: ['notificación', 'alerta', 'aviso', 'email', 'sms'],
      faqs: [
        {
          question: '¿Cómo activo o desactivo las notificaciones de movimientos?',
          answer: 'En "Configuración > Notificaciones" puede gestionar sus preferencias de alertas.'
        },
        {
          question: '¿Puedo recibir alertas sobre transferencias y pagos?',
          answer: 'Sí, active las alertas de operaciones en "Configuración > Notificaciones".'
        },
        {
          question: '¿Cómo personalizo mis alertas de saldo y transacciones?',
          answer: 'En "Configuración > Notificaciones" puede personalizar los tipos de alertas y montos.'
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
          answer: 'Vaya a "Productos > Cuentas" y seleccione "Abrir nueva cuenta".'
        },
        {
          question: '¿Dónde encuentro los cajeros automáticos más cercanos?',
          answer: 'Use la opción "Localizar cajeros" en el menú principal para ver el mapa.'
        },
        {
          question: '¿Cómo contacto al servicio de atención al cliente?',
          answer: 'Puede llamar al 0800-XXX-XXXX o usar el chat en línea.'
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