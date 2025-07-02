const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'donauam@maxitodev.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'DonaUAM';
  }

  async enviarCorreoSolicitudAprobada(solicitud, donacion, donador) {
    const msg = {
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      to: solicitud.correo,
      subject: `🎉 ¡Solicitud Aprobada! - ${donacion.nombre}`,
      html: this.plantillaSolicitudAprobada(solicitud, donacion, donador)
    };

    try {
      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  async enviarCorreoSolicitudRechazada(solicitud, donacion) {
    const msg = {
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      to: solicitud.correo,
      subject: `❌ Solicitud no aprobada - ${donacion.nombre}`,
      html: this.plantillaSolicitudRechazada(solicitud, donacion)
    };

    try {
      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  async enviarCorreoSolicitudRecibida(donador, solicitud, donacion) {
    const msg = {
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      to: donador.correo,
      subject: `📩 Nueva solicitud para: ${donacion.nombre}`,
      html: this.plantillaSolicitudRecibida(donador, solicitud, donacion)
    };

    try {
      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  async enviarCorreoDonacionRegistrada(usuario, donacion) {
    const msg = {
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      to: usuario.correo,
      subject: `🎉 ¡Donación registrada exitosamente! - ${donacion.nombre}`,
      html: this.plantillaDonacionRegistrada(usuario, donacion)
    };

    try {
      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  async enviarCorreoSolicitudEnviada(usuario, donacion) {
    const msg = {
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      to: usuario.correo,
      subject: `📩 ¡Solicitud enviada! - ${donacion.nombre}`,
      html: this.plantillaSolicitudEnviada(usuario, donacion)
    };

    try {
      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  async enviarCorreoBienvenida(usuario) {
    const msg = {
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      to: usuario.correo,
      subject: `🎉 ¡Bienvenido/a a DonaUAM! - Tu cuenta ha sido creada`,
      html: this.plantillaBienvenida(usuario)
    };

    try {
      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  async enviarCorreoRecuperacionContrasena(correo, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const msg = {
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      to: correo,
      subject: '🔐 Recuperación de contraseña - DonaUAM',
      html: this.plantillaRecuperacionContrasena(correo, resetUrl)
    };

    try {
      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  async enviarCorreoContrasenaRestablecida(correo, nombre) {
    const msg = {
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      to: correo,
      subject: '✅ Contraseña restablecida exitosamente - DonaUAM',
      html: this.plantillaContrasenaRestablecida(correo, nombre)
    };

    try {
      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Plantillas HTML
  plantillaSolicitudAprobada(solicitud, donacion, donador) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Solicitud Aprobada - DonaUAM</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container { padding: 15px 10px !important; }
            .content-box { padding: 25px 20px !important; }
            .header-box { padding: 20px 15px !important; }
            .main-title { font-size: 24px !important; }
            .section-title { font-size: 18px !important; }
            .text-content { font-size: 15px !important; }
            .button-container { flex-direction: column !important; gap: 10px !important; }
            .cta-button { width: 100% !important; margin: 0 !important; display: block !important; }
            .detail-grid { gap: 8px !important; }
            .detail-item { padding: 10px !important; }
            .icon-circle { width: 25px !important; height: 25px !important; font-size: 14px !important; }
            .section-padding { padding: 20px !important; }
          }
          .responsive-table { width: 100%; }
          .responsive-table td { padding: 0; }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
        <table class="responsive-table" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <div class="container" style="max-width: 650px; margin: 0 auto; padding: 30px 20px;">
                <!-- Header con logo -->
                <div style="text-align: center; margin-bottom: 40px;">
                  <div class="header-box" style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); margin-bottom: 20px;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 20px; border-radius: 50%; margin-bottom: 20px;">
                      <span style="font-size: 40px; color: white;">🎉</span>
                    </div>
                    <h1 class="main-title" style="color: #1F2937; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">¡Solicitud Aprobada!</h1>
                    <div style="width: 80px; height: 5px; background: linear-gradient(90deg, #4F46E5, #7C3AED); margin: 20px auto; border-radius: 3px;"></div>
                  </div>
                </div>

                <!-- Contenido principal -->
                <div class="content-box" style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); margin-bottom: 20px;">
                  <div style="margin-bottom: 30px;">
                    <p class="text-content" style="font-size: 18px; color: #374151; line-height: 1.8; margin: 0 0 15px 0;">Hola <strong style="color: #4F46E5;">${solicitud.nombre}</strong>,</p>
                    <p class="text-content" style="font-size: 18px; color: #374151; line-height: 1.8; margin: 0;">¡Excelentes noticias! Tu solicitud para la donación <strong style="color: #059669;">"${donacion.nombre}"</strong> ha sido <span style="background: linear-gradient(90deg, #10B981, #059669); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700;">APROBADA</span>.</p>
                  </div>
                  
                  <!-- Tarjeta de donación -->
                  <div style="background: linear-gradient(135deg, #F0FDF4, #ECFDF5); border: 2px solid #10B981; border-radius: 16px; padding: 25px; margin: 30px 0; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; right: -10px; background: #10B981; color: white; padding: 8px 15px; border-radius: 20px; font-size: 12px; font-weight: 600; transform: rotate(15deg);">
                      APROBADA ✓
                    </div>
                    <h3 class="section-title" style="color: #014737; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center; flex-wrap: wrap;">
                      <span class="icon-circle" style="background: #10B981; color: white; border-radius: 50%; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px; flex-shrink: 0;">📦</span>
                      Detalles de tu donación
                    </h3>
                    <div class="detail-grid" style="display: grid; gap: 12px;">
                      <div class="detail-item" style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 10px; border-left: 4px solid #10B981; flex-wrap: wrap;">
                        <span style="margin-right: 12px; font-size: 20px;">🏷️</span>
                        <div style="flex: 1; min-width: 200px;">
                          <strong style="color: #374151;">Artículo:</strong> <span style="color: #059669; font-weight: 600; word-break: break-word;">${donacion.nombre}</span>
                        </div>
                      </div>
                      <div class="detail-item" style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 10px; border-left: 4px solid #10B981; flex-wrap: wrap;">
                        <span style="margin-right: 12px; font-size: 20px;">📂</span>
                        <div style="flex: 1; min-width: 200px;">
                          <strong style="color: #374151;">Categoría:</strong> <span style="color: #059669; font-weight: 600;">${donacion.categoria}</span>
                        </div>
                      </div>
                      <div class="detail-item" style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 10px; border-left: 4px solid #10B981; flex-wrap: wrap;">
                        <span style="margin-right: 12px; font-size: 20px;">👤</span>
                        <div style="flex: 1; min-width: 200px;">
                          <strong style="color: #374151;">Donador:</strong> <span style="color: #059669; font-weight: 600;">${donador.nombre}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Próximos pasos -->
                  <div class="section-padding" style="background: linear-gradient(135deg, #EBF4FF, #DBEAFE); border: 2px solid #3B82F6; border-radius: 16px; padding: 25px; margin: 30px 0;">
                    <h3 class="section-title" style="color: #1E40AF; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center; flex-wrap: wrap;">
                      <span class="icon-circle" style="background: #3B82F6; color: white; border-radius: 50%; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px; flex-shrink: 0;">💡</span>
                      Próximos pasos
                    </h3>
                    <div style="background: white; border-radius: 12px; padding: 20px; border-left: 4px solid #3B82F6;">
                      <p style="margin: 0; color: #1E3A8A; font-size: 16px; line-height: 1.6;">
                        El donador se pondrá en contacto contigo <strong>pronto</strong> para coordinar la entrega. 
                        Mantente atento a tu <strong>WhatsApp</strong> y <strong>email</strong>. 📱✉️
                      </p>
                    </div>
                  </div>

                  <!-- CTA Button -->
                  <div style="text-align: center; margin: 30px 0;">
                    <div class="button-container" style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                      <a href="${process.env.FRONTEND_URL}/mis-solicitudes" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; text-decoration: none; padding: 15px 35px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3); transition: transform 0.2s; min-width: 200px; text-align: center;">
                        Ver mis solicitudes →
                      </a>
                    </div>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; color: white; padding: 20px;">
                  <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; backdrop-filter: blur(10px);">
                    <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">¡Gracias por ser parte de <strong>DonaUAM</strong>! 🎓❤️</p>
                    <p style="margin: 0; font-size: 14px; opacity: 0.9;">Desarrollado con ❤️ por <strong>maxitodev</strong></p>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  plantillaSolicitudRechazada(solicitud, donacion) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Solicitud No Aprobada - DonaUAM</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); min-height: 100vh;">
        <div style="max-width: 650px; margin: 0 auto; padding: 30px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); margin-bottom: 20px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #DC2626, #EF4444); padding: 20px; border-radius: 50%; margin-bottom: 20px;">
                <span style="font-size: 40px; color: white;">😔</span>
              </div>
              <h1 style="color: #1F2937; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Solicitud No Aprobada</h1>
              <div style="width: 80px; height: 5px; background: linear-gradient(90deg, #DC2626, #EF4444); margin: 20px auto; border-radius: 3px;"></div>
            </div>
          </div>

          <!-- Contenido principal -->
          <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); margin-bottom: 20px;">
            <div style="margin-bottom: 30px;">
              <p style="font-size: 18px; color: #374151; line-height: 1.8; margin: 0 0 15px 0;">Hola <strong style="color: #DC2626;">${solicitud.nombre}</strong>,</p>
              <p style="font-size: 18px; color: #374151; line-height: 1.8; margin: 0;">Lamentablemente, tu solicitud para la donación <strong style="color: #DC2626;">"${donacion.nombre}"</strong> no ha sido aprobada en esta ocasión.</p>
            </div>
            
            <!-- Mensaje de ánimo -->
            <div style="background: linear-gradient(135deg, #FEF2F2, #FEE2E2); border: 2px solid #EF4444; border-radius: 16px; padding: 25px; margin: 30px 0; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 15px;">💪</div>
              <h3 style="color: #7F1D1D; margin: 0 0 15px 0; font-size: 20px;">¡No te desanimes!</h3>
              <p style="margin: 0; color: #7F1D1D; font-size: 16px; line-height: 1.6;">
                Hay muchas otras donaciones disponibles que podrían ser <strong>perfectas para ti</strong>.
                Tu generosidad y participación son muy valiosas para nuestra comunidad.
              </p>
            </div>
            
            <!-- Sugerencias -->
            <div style="background: linear-gradient(135deg, #EBF4FF, #DBEAFE); border: 2px solid #3B82F6; border-radius: 16px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1E40AF; margin: 0 0 20px 0; font-size: 18px; display: flex; align-items: center;">
                <span style="background: #3B82F6; color: white; border-radius: 50%; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">💡</span>
                Te animamos a:
              </h3>
              <div style="display: grid; gap: 15px;">
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #3B82F6; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 24px;">🔍</span>
                  <span style="color: #1E3A8A; font-size: 16px;">Explorar otras donaciones disponibles</span>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #3B82F6; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 24px;">🤝</span>
                  <span style="color: #1E3A8A; font-size: 16px;">Seguir participando en la comunidad DonaUAM</span>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #3B82F6; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 24px;">📦</span>
                  <span style="color: #1E3A8A; font-size: 16px;">Considerar hacer tus propias donaciones</span>
                </div>
              </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/home" style="display: inline-block; background: linear-gradient(135deg, #059669, #10B981); color: white; text-decoration: none; padding: 15px 35px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3);">
                Explorar donaciones →
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; color: white; padding: 20px;">
            <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; backdrop-filter: blur(10px);">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">¡Gracias por ser parte de <strong>DonaUAM</strong>! 🎓❤️</p>
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">Desarrollado con ❤️ por <strong>maxitodev</strong></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  plantillaSolicitudRechazada(usuario, solicitud, motivoRechazo) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Solicitud Rechazada - DonaUAM</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); margin-top: 20px; margin-bottom: 20px;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">❌ Solicitud Rechazada</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">DonaUAM</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #333; margin-top: 0; font-size: 24px;">Hola ${usuario.nombre} 👋</h2>
              
              <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
                Lamentamos informarte que tu solicitud para la donación <strong>"${solicitud.donacion.nombre}"</strong> ha sido rechazada.
              </p>

              <div style="background: #fee; border-left: 4px solid #ff6b6b; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <h3 style="color: #d63031; margin-top: 0; font-size: 18px;">📝 Motivo del rechazo:</h3>
                <p style="color: #333; margin: 0; font-size: 16px;">${motivoRechazo || 'No se proporcionó un motivo específico.'}</p>
              </div>

              <p style="color: #666; font-size: 16px;">
                No te desanimes, puedes explorar otras donaciones disponibles en nuestra plataforma.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/home" style="display: inline-block; background: linear-gradient(135deg, #059669, #10B981); color: white; text-decoration: none; padding: 15px 35px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3);">
                  Explorar donaciones →
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #6c757d; margin: 0; font-size: 14px;">
                Este correo fue enviado por <strong>maxitodev</strong> | DonaUAM - Plataforma de Donaciones UAM
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  plantillaSolicitudRecibida(donador, solicitud, donacion) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nueva Solicitud Recibida - DonaUAM</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); min-height: 100vh;">
        <div style="max-width: 650px; margin: 0 auto; padding: 30px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); margin-bottom: 20px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #059669, #10B981); padding: 20px; border-radius: 50%; margin-bottom: 20px;">
                <span style="font-size: 40px; color: white;">📩</span>
              </div>
              <h1 style="color: #1F2937; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Nueva Solicitud Recibida</h1>
              <div style="width: 80px; height: 5px; background: linear-gradient(90deg, #059669, #10B981); margin: 20px auto; border-radius: 3px;"></div>
            </div>
          </div>

          <!-- Contenido principal -->
          <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); margin-bottom: 20px;">
            <div style="margin-bottom: 30px;">
              <p style="font-size: 18px; color: #374151; line-height: 1.8; margin: 0 0 15px 0;">Hola <strong style="color: #059669;">${donador.nombre}</strong>,</p>
              <p style="font-size: 18px; color: #374151; line-height: 1.8; margin: 0;">Has recibido una nueva solicitud para tu donación <strong style="color: #059669;">"${donacion.nombre}"</strong>. 🎉</p>
            </div>
            
            <!-- Información del solicitante -->
            <div style="background: linear-gradient(135deg, #F0FDF4, #ECFDF5); border: 2px solid #22C55E; border-radius: 16px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #14532D; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
                <span style="background: #22C55E; color: white; border-radius: 50%; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">👤</span>
                Información del solicitante
              </h3>
              <div style="display: grid; gap: 12px;">
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #22C55E; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 20px;">👋</span>
                  <div>
                    <strong style="color: #374151;">Nombre:</strong> <span style="color: #059669; font-weight: 600;">${solicitud.nombre}</span>
                  </div>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #22C55E; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 20px;">📧</span>
                  <div>
                    <strong style="color: #374151;">Email:</strong> <span style="color: #059669; font-weight: 600;">${solicitud.correo}</span>
                  </div>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #22C55E; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 20px;">📱</span>
                  <div>
                    <strong style="color: #374151;">WhatsApp:</strong> <span style="color: #059669; font-weight: 600;">${solicitud.whatsapp || 'No proporcionado'}</span>
                  </div>
                </div>
                ${solicitud.motivo ? `
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #22C55E;">
                  <div style="display: flex; align-items: flex-start;">
                    <span style="margin-right: 15px; font-size: 20px; margin-top: 2px;">💬</span>
                    <div style="flex: 1;">
                      <strong style="color: #374151;">Motivo de la solicitud:</strong>
                      <p style="color: #059669; font-weight: 500; margin: 8px 0 0 0; line-height: 1.5; font-style: italic;">"${solicitud.motivo}"</p>
                    </div>
                  </div>
                </div>
                ` : ''}
              </div>
            </div>
            
            <!-- Acción requerida -->
            <div style="background: linear-gradient(135deg, #FEF7EC, #FEF3C7); border: 2px solid #F59E0B; border-radius: 16px; padding: 25px; margin: 30px 0; text-align: center;">
              <h3 style="color: #92400E; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center; justify-content: center;">
                <span style="background: #F59E0B; color: white; border-radius: 50%; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">⏰</span>
                Acción requerida
              </h3>
              <div style="background: white; border-radius: 12px; padding: 20px; border-left: 4px solid #F59E0B;">
                <p style="margin: 0; color: #B45309; font-size: 16px; line-height: 1.6;">
                  <strong>Revisa la solicitud</strong> en la plataforma DonaUAM y decide si deseas 
                  <span style="color: #059669; font-weight: 700;">aprobarla</span> o 
                  <span style="color: #DC2626; font-weight: 700;">rechazarla</span>.
                </p>
              </div>
            </div>

            <!-- CTA Buttons -->
            <div style="text-align: center; margin: 30px 0; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
              <a href="${process.env.FRONTEND_URL}/solicitudes-donacion/${donacion._id || donacion.id || ''}" style="display: inline-block; background: linear-gradient(135deg, #059669, #10B981); color: white; text-decoration: none; padding: 15px 30px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3);">
                ✅ Revisar solicitudes
              </a>
              <a href="${process.env.FRONTEND_URL}/mis-donaciones" style="display: inline-block; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; text-decoration: none; padding: 15px 30px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);">
                📦 Mis donaciones
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; color: white; padding: 20px;">
            <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; backdrop-filter: blur(10px);">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">¡Gracias por ser parte de <strong>DonaUAM</strong>! 🎓❤️</p>
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">Desarrollado con ❤️ por <strong>maxitodev</strong></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  plantillaDonacionRegistrada(usuario, donacion) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Donación Registrada - DonaUAM</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); min-height: 100vh;">
        <div style="max-width: 650px; margin: 0 auto; padding: 30px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); margin-bottom: 20px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #059669, #10B981); padding: 20px; border-radius: 50%; margin-bottom: 20px;">
                <span style="font-size: 40px; color: white;">🎉</span>
              </div>
              <h1 style="color: #1F2937; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">¡Donación Registrada!</h1>
              <div style="width: 80px; height: 5px; background: linear-gradient(90deg, #059669, #10B981); margin: 20px auto; border-radius: 3px;"></div>
              <p style="color: #6B7280; font-size: 16px; margin: 15px 0 0 0;">¡Gracias por tu generosidad! 🙏</p>
            </div>
          </div>

          <!-- Contenido principal -->
          <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); margin-bottom: 20px;">
            <div style="margin-bottom: 30px;">
              <p style="font-size: 18px; color: #374151; line-height: 1.8; margin: 0 0 15px 0;">Hola <strong style="color: #059669;">${usuario.nombre}</strong>,</p>
              <p style="font-size: 18px; color: #374151; line-height: 1.8; margin: 0;">Tu donación <strong style="color: #059669;">"${donacion.nombre}"</strong> ha sido registrada exitosamente en <span style="background: linear-gradient(90deg, #059669, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700;">DonaUAM</span>.</p>
            </div>
            
            <!-- Detalles de la donación -->
            <div style="background: linear-gradient(135deg, #F0FDF4, #ECFDF5); border: 2px solid #22C55E; border-radius: 16px; padding: 25px; margin: 30px 0; position: relative; overflow: hidden;">
              <div style="position: absolute; top: -10px; right: -10px; background: #22C55E; color: white; padding: 8px 15px; border-radius: 20px; font-size: 12px; font-weight: 600; transform: rotate(15deg);">
                ACTIVA ✓
              </div>
              <h3 style="color: #14532D; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
                <span style="background: #22C55E; color: white; border-radius: 50%; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">📦</span>
                Tu donación registrada
              </h3>
              <div style="display: grid; gap: 12px;">
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #22C55E; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 20px;">🏷️</span>
                  <div>
                    <strong style="color: #374151;">Artículo:</strong> <span style="color: #059669; font-weight: 600;">${donacion.nombre}</span>
                  </div>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #22C55E; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 20px;">📂</span>
                  <div>
                    <strong style="color: #374151;">Categoría:</strong> <span style="color: #059669; font-weight: 600;">${donacion.categoria}</span>
                  </div>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #22C55E; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 20px;">📝</span>
                  <div>
                    <strong style="color: #374151;">Descripción:</strong> <span style="color: #059669; font-weight: 500;">${donacion.descripcion}</span>
                  </div>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #22C55E; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 20px;">⚡</span>
                  <div>
                    <strong style="color: #374151;">Estado:</strong> <span style="background: #DCFCE7; color: #166534; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 14px;">${donacion.estado}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Qué sigue -->
            <div style="background: linear-gradient(135deg, #EBF4FF, #DBEAFE); border: 2px solid #3B82F6; border-radius: 16px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1E40AF; margin: 0 0 20px 0; font-size: 18px; display: flex; align-items: center;">
                <span style="background: #3B82F6; color: white; border-radius: 50%; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">💡</span>
                ¿Qué sigue ahora?
              </h3>
              <div style="display: grid; gap: 15px;">
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #3B82F6; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 24px;">👀</span>
                  <span style="color: #1E3A8A; font-size: 16px;">Los usuarios podrán ver tu donación y enviar solicitudes</span>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #3B82F6; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 24px;">🔔</span>
                  <span style="color: #1E3A8A; font-size: 16px;">Recibirás notificaciones cuando alguien esté interesado</span>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #3B82F6; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 24px;">✅</span>
                  <span style="color: #1E3A8A; font-size: 16px;">Podrás aprobar o rechazar solicitudes desde tu panel</span>
                </div>
              </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/mis-donaciones" style="display: inline-block; background: linear-gradient(135deg, #059669, #10B981); color: white; text-decoration: none; padding: 15px 35px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3);">
                Ver mis donaciones →
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; color: white; padding: 20px;">
            <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; backdrop-filter: blur(10px);">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">¡Gracias por hacer la diferencia en <strong>DonaUAM</strong>! 🎓❤️</p>
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">Desarrollado con ❤️ por <strong>maxitodev</strong></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  plantillaSolicitudEnviada(usuario, donacion) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Solicitud Enviada - DonaUAM</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); min-height: 100vh;">
        <div style="max-width: 650px; margin: 0 auto; padding: 30px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); margin-bottom: 20px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #EA580C, #F97316); padding: 20px; border-radius: 50%; margin-bottom: 20px;">
                <span style="font-size: 40px; color: white;">📩</span>
              </div>
              <h1 style="color: #1F2937; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">¡Solicitud Enviada!</h1>
              <div style="width: 80px; height: 5px; background: linear-gradient(90deg, #EA580C, #F97316); margin: 20px auto; border-radius: 3px;"></div>
              <p style="color: #6B7280; font-size: 16px; margin: 15px 0 0 0;">Tu solicitud está en proceso 🚀</p>
            </div>
          </div>

          <!-- Contenido principal -->
          <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); margin-bottom: 20px;">
            <div style="margin-bottom: 30px;">
              <p style="font-size: 18px; color: #374151; line-height: 1.8; margin: 0 0 15px 0;">Hola <strong style="color: #EA580C;">${usuario.nombre}</strong>,</p>
              <p style="font-size: 18px; color: #374151; line-height: 1.8; margin: 0;">Tu solicitud para la donación <strong style="color: #EA580C;">"${donacion.nombre}"</strong> ha sido enviada exitosamente. ✨</p>
            </div>
            
            <!-- Detalles de la solicitud -->
            <div style="background: linear-gradient(135deg, #FFF7ED, #FFEDD5); border: 2px solid #F97316; border-radius: 16px; padding: 25px; margin: 30px 0; position: relative; overflow: hidden;">
              <div style="position: absolute; top: -10px; right: -10px; background: #F97316; color: white; padding: 8px 15px; border-radius: 20px; font-size: 12px; font-weight: 600; transform: rotate(15deg);">
                ENVIADA ✓
              </div>
              <h3 style="color: #9A3412; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
                <span style="background: #F97316; color: white; border-radius: 50%; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">📋</span>
                Detalles de tu solicitud
              </h3>
              <div style="display: grid; gap: 12px;">
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #F97316; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 20px;">🏷️</span>
                  <div>
                    <strong style="color: #374151;">Artículo:</strong> <span style="color: #EA580C; font-weight: 600;">${donacion.nombre}</span>
                  </div>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #F97316; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 20px;">📂</span>
                  <div>
                    <strong style="color: #374151;">Categoría:</strong> <span style="color: #EA580C; font-weight: 600;">${donacion.categoria}</span>
                  </div>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #F97316; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 20px;">⏳</span>
                  <div>
                    <strong style="color: #374151;">Estado:</strong> <span style="background: #FED7AA; color: #9A3412; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 14px;">Pendiente de revisión</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Qué sigue -->
            <div style="background: linear-gradient(135deg, #EBF4FF, #DBEAFE); border: 2px solid #3B82F6; border-radius: 16px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1E40AF; margin: 0 0 20px 0; font-size: 18px; display: flex; align-items: center;">
                <span style="background: #3B82F6; color: white; border-radius: 50%; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">⏳</span>
                ¿Qué sigue ahora?
              </h3>
              <div style="display: grid; gap: 15px;">
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #3B82F6; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 24px;">👀</span>
                  <span style="color: #1E3A8A; font-size: 16px;">El donador revisará tu solicitud cuidadosamente</span>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #3B82F6; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 24px;">📧</span>
                  <span style="color: #1E3A8A; font-size: 16px;">Recibirás una notificación por email con la respuesta</span>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #3B82F6; display: flex; align-items: center;">
                  <span style="margin-right: 15px; font-size: 24px;">🤝</span>
                  <span style="color: #1E3A8A; font-size: 16px;">Si es aprobada, podrán coordinar la entrega</span>
                </div>
              </div>
            </div>

            <!-- Mensaje motivacional -->
            <div style="background: linear-gradient(135deg, #F0FDF4, #ECFDF5); border: 2px solid #10B981; border-radius: 16px; padding: 25px; margin: 30px 0; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 15px;">🤞</div>
              <h3 style="color: #065F46; margin: 0 0 15px 0; font-size: 18px;">¡Dedos cruzados!</h3>
              <p style="margin: 0; color: #065F46; font-size: 16px; line-height: 1.6;">
                Esperamos que tu solicitud sea aprobada. <strong>¡Mantente positivo!</strong> 
                Mientras tanto, puedes explorar otras donaciones disponibles.
              </p>
            </div>

            <!-- CTA Buttons -->
            <div style="text-align: center; margin: 30px 0; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
              <a href="${process.env.FRONTEND_URL}/mis-solicitudes" style="display: inline-block; background: linear-gradient(135deg, #EA580C, #F97316); color: white; text-decoration: none; padding: 15px 30px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px rgba(234, 88, 12, 0.3);">
                📋 Mis solicitudes
              </a>
              <a href="${process.env.FRONTEND_URL}/home" style="display: inline-block; background: linear-gradient(135deg, #059669, #10B981); color: white; text-decoration: none; padding: 15px 30px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3);">
                🔍 Explorar más
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; color: white; padding: 20px;">
            <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; backdrop-filter: blur(10px);">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">¡Gracias por participar en <strong>DonaUAM</strong>! 🎓❤️</p>
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">Desarrollado con ❤️ por <strong>maxitodev</strong></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  plantillaRecuperacionContrasena(correo, resetUrl) {
    return `
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de Contraseña - DonaUAM</title>
        <style>
          body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 20px 20px 0 0; }
          .content-box { background: white; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); margin-bottom: 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; text-align: center; transition: all 0.3s ease; }
          .button:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4); }
          .warning-box { background: linear-gradient(135deg, #fff3cd, #ffeaa7); border-left: 4px solid #e17055; padding: 20px; border-radius: 12px; margin: 20px 0; }
          .footer { background: #2d3436; color: #b2bec3; padding: 30px; text-align: center; border-radius: 0 0 20px 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 32px; font-weight: 700;">🔐 Recuperación de Contraseña</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">DonaUAM - Sistema de Donaciones UAM</p>
          </div>
          
          <div class="content-box">
            <h2 style="color: #333; margin-top: 0; font-size: 24px;">Hola 👋</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>DonaUAM</strong> 
              asociada al correo <strong>${correo}</strong>.
            </p>

            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Si solicitaste este cambio, haz clic en el botón de abajo para crear una nueva contraseña:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button" style="color: white; text-decoration: none;">
                🔑 Restablecer mi contraseña
              </a>
            </div>

            <div class="warning-box">
              <h3 style="color: #e17055; margin-top: 0; font-size: 18px; display: flex; align-items: center;">
                <span style="margin-right: 10px;">⚠️</span>
                Información importante
              </h3>
              <ul style="color: #333; margin: 15px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Este enlace es válido por <strong>1 hora</strong> únicamente</li>
                <li style="margin-bottom: 8px;">Solo puedes usarlo <strong>una vez</strong></li>
                <li style="margin-bottom: 8px;">Si no solicitaste este cambio, ignora este correo</li>
                <li style="margin-bottom: 0;">Tu contraseña actual permanecerá sin cambios si no usas este enlace</li>
              </ul>
            </div>

            <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #333; margin-top: 0; font-size: 16px;">¿Problemas con el enlace?</h4>
              <p style="color: #666; font-size: 14px; margin: 10px 0; line-height: 1.5;">
                Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
              </p>
              <p style="color: #667eea; font-size: 12px; word-break: break-all; background: #f1f3f4; padding: 10px; border-radius: 6px; margin: 10px 0;">
                ${resetUrl}
              </p>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
              Si tienes problemas, contacta al soporte técnico de DonaUAM.
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0; font-size: 14px;">
              <strong>DonaUAM</strong> - Universidad Autónoma Metropolitana<br>
              Sistema de Donaciones Universitarias
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
              Este es un correo automático, no responder a esta dirección.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  plantillaContrasenaRestablecida(correo, nombre) {
    return `
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contraseña Restablecida - DonaUAM</title>
        <style>
          body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00b894 0%, #00a085 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 20px 20px 0 0; }
          .content-box { background: white; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); margin-bottom: 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #00b894 0%, #00a085 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; text-align: center; }
          .success-box { background: linear-gradient(135deg, #d4edda, #c3e6cb); border-left: 4px solid #00b894; padding: 20px; border-radius: 12px; margin: 20px 0; }
          .footer { background: #2d3436; color: #b2bec3; padding: 30px; text-align: center; border-radius: 0 0 20px 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 32px; font-weight: 700;">✅ ¡Contraseña Restablecida!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">DonaUAM - Sistema de Donaciones UAM</p>
          </div>
          
          <div class="content-box">
            <h2 style="color: #333; margin-top: 0; font-size: 24px;">¡Hola ${nombre || 'Usuario'}! 👋</h2>
            
            <div class="success-box">
              <h3 style="color: #00a085; margin-top: 0; font-size: 18px; display: flex; align-items: center;">
                <span style="margin-right: 10px;">🎉</span>
                ¡Proceso completado exitosamente!
              </h3>
              <p style="color: #333; margin: 10px 0;">
                Tu contraseña ha sido restablecida correctamente para la cuenta <strong>${correo}</strong>.
              </p>
            </div>

            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Ya puedes iniciar sesión en DonaUAM con tu nueva contraseña. Tu cuenta está segura y lista para usar.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/login" class="button" style="color: white; text-decoration: none;">
                🚀 Iniciar sesión ahora
              </a>
            </div>

            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <h4 style="color: #1976d2; margin-top: 0; font-size: 16px;">💡 Consejos de seguridad</h4>
              <ul style="color: #333; margin: 15px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Mantén tu contraseña segura y no la compartas</li>
                <li style="margin-bottom: 8px;">Usa una contraseña única para DonaUAM</li>
                <li style="margin-bottom: 8px;">Cierra sesión en dispositivos compartidos</li>
                <li style="margin-bottom: 0;">Si notas actividad sospechosa, contacta soporte</li>
              </ul>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
              Si no fuiste tú quien realizó este cambio, contacta inmediatamente al soporte técnico.
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0; font-size: 14px;">
              <strong>DonaUAM</strong> - Universidad Autónoma Metropolitana<br>
              Sistema de Donaciones Universitarias
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
              Este es un correo automático, no responder a esta dirección.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ...existing plantillas...
}

module.exports = new EmailService();
