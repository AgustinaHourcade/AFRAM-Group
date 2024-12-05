import { Injectable } from '@angular/core';
import { FaqItem, TopicItem } from '../interface/chat.interface';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private topics: TopicItem[] = [
    {
      title: 'Cuenta y Seguridad',
      icon: 'bi-fingerprint',
      keywords: ['contraseña', 'clave', 'seguridad', 'usuario', 'personal', 'sospechosa', '2fa', 'autenticación', 'acceso', 'cambio', 'perfil', 'recuperación'],
      faqs: [
        {
          question: '¿Cómo cambio mi contraseña?',
          answer: 'Para cambiar su contraseña, vaya a la sección "Perfil" y seleccione la opción "Cambiar contraseña".'
        },
        {
          question: '¿Qué hago si olvidé mi usuario o contraseña?',
          answer: 'En la página de LogIn, haga click en "¿Olvidó su contraseña?" y siga los pasos de recuperación.'
        },
        {
          question: '¿Cómo actualizo mi información personal (email, teléfono, etc.)?',
          answer: 'Acceda a su perfil, seleccione "Ver perfil" y apriete en  "Modificar perfil" para actualizar sus datos.'
        },
        {
          question: '¿Qué debo hacer si detecto actividad sospechosa en mi cuenta?',
          answer: 'Actualice su contraseña haciendo click en "Modificar contraseña" o dirijase a una de nuestras sucursales'
        }
      ]
    },
    {
      title: 'Transferencias',
      icon: 'bi bi-arrow-left-right',
      keywords: ['transferencia', 'pago','servicio', 'programar', 'futura', 'envío', 'comprobante', 'operación', 'transferir', 'transaccion'],
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
        },
        {
          question: '¿Puedo programar una transferencia?',
          answer: 'Vaya a la sección "Transferencias", seleccione la opcion "Programar transferencia", ingrese la fecha, luego ingrese el alias o cbu y el monto a transferir.'
        }
      ]
    },
    {
      title: 'Tarjetas',
      icon: 'bi-credit-card-fill',
      keywords: ['tarjeta', 'crédito', 'débito', 'robo', 'perdida', 'límites', 'solicitar'],
      faqs: [
        {
          question: '¿Cómo solicito una tarjeta de crédito o débito?',
          answer: 'Acceda a "Tarjetas", "Nueva tarjeta" y seleccione la cuenta y el tipo para soliciatarla.'
        },
        {
          question: '¿Cómo reporto una tarjeta perdida o robada?',
          answer: 'Acceda a "Soporte", cree una "Nueva consulta", elija el tema que corresponda y deje un mensaje con su problema.'
        },
        {
          question: '¿Cómo doy de baja una tarjeta?',
          answer: 'Acceda a "Tarjetas" y seleccione la opción "Dar de baja" que corresponda a la tarjeta extraviada.'
        },
        {
          question: '¿Donde veo mis tarjetas?',
          answer: 'Puede ver todas sus tarjetas accediendo a "Tarjeta" e ingrese en la seccion "Mis tarjetas".'
        }
      ]
    },
    {
      title: 'Consultas de Saldo y Movimientos',
      icon: 'bi-bar-chart-line',
      keywords: ['saldo', 'movimiento', 'extracto', 'estado', 'cuenta', 'historial', 'consultar', 'ver'],
      faqs: [
        {
          question: '¿Cómo consulto el saldo de mi cuenta?',
          answer: 'El saldo se muestra en la página principal o en la sección "Mis cuentas".'
        },
        {
          question: '¿Donde veo mis movimientos bancarios?',
          answer: 'Acceda a la pagina principal en la seccion "Movimientos", y luego seleccione la cuenta correspondiente.'
        },
        {
          question: '¿Cómo veo el historial de mis movimientos bancarios?',
          answer: 'En la seccion "Mis cuentas", luego seleccione ver datos y elija el mes que desee.'
        },
        {
          question: '¿Cómo descargo historial de mis movimientos bancarios?',
          answer: 'En la seccion "Mis cuentas", luego seleccione ver datos, elija el mes que desee y seleccione "Descargar resumen" .'
        },
        {
          question: '¿Cómo veo un comprobante el transaccion?',
          answer: 'Acceda a la pagina principal en la seccion "Movimientos", seleccione la cuenta correspondiente, elija el movimiento que desee y seleccione "Ver Comprobante"'
        },
        {
          question: '¿Cómo veo un comprobante el transaccion?',
          answer: 'Acceda a la pagina principal en la seccion "Movimientos", seleccione la cuenta correspondiente, elija el movimiento que desee, seleccione "Ver Comprobante" y elija "Descargar comprobante"'
        }
      ]
    },
    {
      title: 'Inversiones',
      icon: 'bi-graph-up',
      keywords: ['dólares', 'dolares', 'dólar', 'dolar', 'plazo fijo','préstamo', 'prestamo','vencimiento', 'interes', 'interés', 'compra', 'venta'],
      faqs: [
        {
          question: '¿Cómo compro y vendo dólares?',
          answer: 'Dirijase a la parte de "Inversiones", "Dólares" ahí va a poder seleccionar si desea "Comprar" o "Vender".'
        },
        {
          question: '¿Cómo hago un plazo fijo?',
          answer: 'Dirijase a la sección de "Soporte", ahí va a poder ver un listado de las consultas "Activas" y "Finalizadas".'
        },
        {
          question: '¿Cómo veo un plazo fijo',
          answer: 'El soporte está disponible las 24hs del día. Nuestros asistentes te responderán lo antes posible.'
        },
        {
          question: '¿Cómo hago un prestamo?',
          answer: 'El soporte está disponible las 24hs del día. Nuestros asistentes te responderán lo antes posible.'
        },
        {
          question: '¿Cómo veo un prestamo?',
          answer: 'El soporte está disponible las 24hs del día. Nuestros asistentes te responderán lo antes posible.'
        },
        {
          question: '¿Cómo pago un prestamo?',
          answer: 'El soporte está disponible las 24hs del día. Nuestros asistentes te responderán lo antes posible.'
        }
      ]
    },
    {
      title: 'Canal de soporte',
      icon: 'bi-chat-text-fill',
      keywords: ['ayuda', 'soporte', 'contacto', 'atención', 'atencion', 'consultas', 'errores', 'error'],
      faqs: [
        {
          question: '¿Cómo contacto al servicio de atención al cliente? ',
          answer: 'Puede iniciar una consulta en la sección "Soporte", nuestros asistentes le responderán a la brevedad.'
        },
        {
          question: '¿Cuáles son los horarios de atención de soporte?',
          answer: 'El soporte está disponible las 24hs del día. Nuestros asistentes te responderán lo antes posible.'
        },
        {
          question: '¿Cómo puedo ver mis consultas?',
          answer: 'Dirijase a la seccion de "Soporte", ahí va a poder ver un listado de las consultas "Activas" y "Finalizadas".'
        }
      ]
    },
    {
      title: 'Otros Servicios y Ayuda',
      icon: 'bi-question-square',
      keywords: ['ayuda', 'soporte', 'cajero', 'sucursal', 'contacto', 'horario', 'atención', 'atencion', 'servicios', 'consultas', 'localizar'],
      faqs: [
        {
          question: '¿Cómo abro una nueva cuenta?',
          answer: 'Vaya a "Cuentas" y seleccione "Solicitar cuenta".'
        },
        {
          question: '¿Cómo contacto al servicio de atención al cliente?',
          answer: 'Puede iniciar una consulta en la sección "Soporte", nuestros asistentes le responderán a la brevedad.'
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
      return `Si tenes dudas sobre ${matchingTopic.title}, aquí tienes algunas preguntas frecuentes sobre este tema:`;
    }

    return 'Por favor, seleccione una de las preguntas disponibles en el menú o intente reformular su pregunta.';
  }
}
