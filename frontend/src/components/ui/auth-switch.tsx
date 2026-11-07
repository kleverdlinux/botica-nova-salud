"use client";

import React, { useState } from "react";
import type { FormEvent } from "react";
import {
  Mail,
  Lock,
  User,
  Phone,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { loginClient, registerClient, ClientProfile } from "@/utils/orderStorage";
import { notificarExito, notificarError, notificarAdvertencia } from "@/utils/alertaSweet";

export interface AuthSwitchProps {
  onLoginSuccess?: (client: ClientProfile) => void;
  defaultMode?: "signin" | "signup";
}

export default function AuthSwitch({ onLoginSuccess, defaultMode = "signin" }: AuthSwitchProps) {
  const [isSignUp, setIsSignUp] = useState(defaultMode === "signup");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Estados de Iniciar Sesión
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Estados de Registro
  const [registerData, setRegisterData] = useState({
    name: "",
    dni: "",
    email: "",
    phone: "",
    password: "",
    address: "Lima Cercado",
    district: "Lima Cercado",
  });

  const handleSignInSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!loginIdentifier.trim()) {
      notificarAdvertencia("Campo Requerido", "Por favor ingresa tu DNI o correo electrónico.");
      return;
    }

    const result = loginClient(loginIdentifier.trim(), loginPassword);
    if (!result.success || !result.client) {
      notificarError("Error de Acceso", result.message || "Credenciales no encontradas.");
      return;
    }

    notificarExito("¡Bienvenido(a)!", `Hola ${result.client.name}, has iniciado sesión.`);
    if (onLoginSuccess) {
      onLoginSuccess(result.client);
    } else {
      navigate("/cliente");
    }
  };

  const handleSignUpSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!registerData.name.trim()) {
      notificarAdvertencia("Campo Requerido", "Ingresa tus nombres y apellidos.");
      return;
    }
    if (!/^\d{8}$/.test(registerData.dni.trim())) {
      notificarAdvertencia("DNI Inválido", "El DNI debe contener 8 dígitos numéricos.");
      return;
    }
    if (!registerData.email.includes("@")) {
      notificarAdvertencia("Correo Inválido", "Ingresa un correo electrónico válido.");
      return;
    }
    if (registerData.password.length < 6) {
      notificarAdvertencia("Contraseña Corta", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const result = registerClient({
      name: registerData.name,
      dni: registerData.dni,
      email: registerData.email,
      phone: registerData.phone || "999999999",
      address: registerData.address || "Lima",
      district: registerData.district || "Lima Cercado",
      password: registerData.password,
    });

    if (!result.success || !result.client) {
      notificarError("Error al Registrar", result.message);
      return;
    }

    notificarExito("¡Cuenta Creada!", result.message);
    if (onLoginSuccess) {
      onLoginSuccess(result.client);
    } else {
      navigate("/cliente");
    }
  };

  const handleFillDemo = () => {
    const demo = loginClient("72345678", "123456");
    if (demo.success && demo.client) {
      setLoginIdentifier("72345678");
      setLoginPassword("123456");
      notificarExito("Cliente Demo", "Credenciales de prueba cargadas.");
    } else {
      const reg = registerClient({
        name: "María Elena Quispe",
        dni: "72345678",
        email: "maria.quispe@gmail.com",
        phone: "955545561",
        address: "Av. Arequipa 1840, Dpto 502",
        district: "Lince",
        password: "demo123Password"
      });
      if (reg.client) {
        setLoginIdentifier("maria.quispe@gmail.com");
        setLoginPassword("demo123Password");
        notificarExito("Cliente Demo Creado", "Credenciales de prueba listas.");
      }
    }
  };

  return (
    <div className="auth-switch">
      <style>{`
        .auth-switch,
        .auth-switch * {
          box-sizing: border-box;
        }

        .auth-switch {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: #f4f4f5;
          min-height: 100vh;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .container {
          position: relative;
          width: 100%;
          max-width: 1000px;
          height: 590px;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          border: 1px solid #e4e4e7;
        }

        .forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 4rem;
          transition: all 0.2s 0.7s;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }

        form.sign-up-form {
          opacity: 0;
          z-index: 1;
        }

        form.sign-in-form {
          z-index: 2;
        }

        .title {
          font-size: 1.85rem;
          color: #09090b;
          margin-bottom: 6px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .subtitle {
          font-size: 0.75rem;
          color: #71717a;
          margin-bottom: 14px;
          text-align: center;
        }

        .input-field {
          max-width: 360px;
          width: 100%;
          background-color: #f4f4f5;
          margin: 6px 0;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          padding: 0 1rem;
          position: relative;
          transition: 0.3s;
          border: 1px solid #e4e4e7;
        }

        .input-field:focus-within {
          background-color: #ffffff;
          border-color: #09090b;
          box-shadow: 0 0 0 1px #09090b;
        }

        .input-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #71717a;
          margin-right: 10px;
          flex-shrink: 0;
        }

        .input-field input {
          background: none;
          outline: none;
          border: none;
          line-height: 1;
          font-weight: 500;
          font-size: 0.85rem;
          color: #09090b;
          width: 100%;
        }

        .input-field input::placeholder {
          color: #a1a1aa;
          font-weight: 400;
        }

        .btn {
          width: 100%;
          max-width: 360px;
          background-color: #09090b;
          border: none;
          outline: none;
          height: 46px;
          border-radius: 12px;
          color: #ffffff;
          font-weight: 700;
          margin: 12px 0 6px 0;
          cursor: pointer;
          transition: 0.3s;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .btn:hover {
          background-color: #27272a;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
        }

        .panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        /* Curvatura original exacta del prompt (suave, luminosa, SIN FONDO NEGRO) */
        .container:before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          transition: 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
          box-shadow: 0 0 45px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .image {
          width: 100%;
          max-width: 310px;
          max-height: 250px;
          object-fit: contain;
          transition: transform 1.1s ease-in-out;
          transition-delay: 0.4s;
          filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.08));
        }

        .panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-around;
          text-align: center;
          z-index: 7;
        }

        .left-panel {
          pointer-events: all;
          padding: 2.5rem 15% 1.5rem 8%;
        }

        .right-panel {
          pointer-events: none;
          padding: 2.5rem 8% 1.5rem 15%;
        }

        .left-panel .image {
          transform: translateX(-32px);
        }

        .left-panel .content {
          transform: translateX(-32px);
        }

        .panel .content {
          color: #09090b;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          max-width: 310px;
          margin: 0 auto;
        }

        .panel h3 {
          font-weight: 800;
          line-height: 1.2;
          font-size: 1.5rem;
          color: #09090b;
          margin-bottom: 6px;
          letter-spacing: -0.02em;
        }

        .panel p {
          font-size: 0.82rem;
          padding: 0.3rem 0 1rem 0;
          color: #52525b;
          max-width: 290px;
          line-height: 1.45;
          margin: 0 auto;
        }

        .btn.transparent {
          background: #ffffff;
          border: 1.5px solid #09090b;
          width: 150px;
          height: 42px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.78rem;
          color: #09090b;
          cursor: pointer;
          transition: 0.3s;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }

        .btn.transparent:hover {
          background: #09090b;
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .right-panel .image,
        .right-panel .content {
          transform: translateX(800px);
        }

        /* ANIMACIÓN EXACTA DEL PROMPT */
        .container.sign-up-mode:before {
          transform: translate(100%, -50%);
          right: 52%;
        }

        .container.sign-up-mode .left-panel .image,
        .container.sign-up-mode .left-panel .content {
          transform: translateX(-800px);
        }

        .container.sign-up-mode .signin-signup {
          left: 25%;
        }

        .container.sign-up-mode form.sign-up-form {
          opacity: 1;
          z-index: 2;
        }

        .container.sign-up-mode form.sign-in-form {
          opacity: 0;
          z-index: 1;
        }

        .container.sign-up-mode .right-panel .image {
          transform: translateX(32px);
        }

        .container.sign-up-mode .right-panel .content {
          transform: translateX(32px);
        }

        .container.sign-up-mode .left-panel {
          pointer-events: none;
        }

        .container.sign-up-mode .right-panel {
          pointer-events: all;
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #e4e4e7;
          color: #09090b;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        }

        .aux-link {
          font-size: 0.72rem;
          color: #71717a;
          margin-top: 10px;
          text-decoration: none;
          transition: 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .aux-link:hover {
          color: #09090b;
        }

        @media (max-width: 870px) {
          .container {
            min-height: 800px;
            height: auto;
          }

          .signin-signup {
            width: 100%;
            top: 95%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }

          .signin-signup,
          .container.sign-up-mode .signin-signup {
            left: 50%;
          }

          .panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }

          .panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2.5rem 8%;
            grid-column: 1 / 2;
          }

          .right-panel {
            grid-row: 3 / 4;
          }

          .left-panel {
            grid-row: 1 / 2;
          }

          .image {
            width: 200px;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.6s;
          }

          .panel .content {
            padding-right: 15%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
          }

          .container:before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }

          .container.sign-up-mode:before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
          }

          .container.sign-up-mode .left-panel .image,
          .container.sign-up-mode .left-panel .content {
            transform: translateY(-300px);
          }

          .container.sign-up-mode .right-panel .image,
          .container.sign-up-mode .right-panel .content {
            transform: translateY(0px);
          }

          .right-panel .image,
          .right-panel .content {
            transform: translateY(300px);
          }

          .container.sign-up-mode .signin-signup {
            top: 5%;
            transform: translate(-50%, 0);
          }
        }

        @media (max-width: 570px) {
          form {
            padding: 0 1.5rem;
          }

          .image {
            display: none;
          }

          .panel .content {
            padding: 0.5rem 1rem;
          }
        }
      `}</style>

      <div className={isSignUp ? "container sign-up-mode" : "container"}>
        {/* Formularios Interactivos */}
        <div className="forms-container">
          <div className="signin-signup">
            {/* Formulario 1: Iniciar Sesión (Sign In) */}
            <form className="sign-in-form" onSubmit={handleSignInSubmit}>
              <h2 className="title">Iniciar Sesión</h2>
              <p className="subtitle">Ingresa con tu DNI o Correo de cliente</p>

              <div className="input-field">
                <span className="input-icon-box">
                  <Mail className="w-4 h-4 stroke-[1.75]" />
                </span>
                <input
                  type="text"
                  placeholder="DNI o Correo electrónico"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="input-field">
                <span className="input-icon-box">
                  <Lock className="w-4 h-4 stroke-[1.75]" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-icon-box ml-auto text-neutral-400 hover:text-neutral-900 transition cursor-pointer"
                  style={{ marginRight: 0 }}
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5 stroke-[1.75]" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 stroke-[1.75]" />
                  )}
                </button>
              </div>

              <button type="submit" className="btn">
                <span>Ingresar a Mi Cuenta</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              <div className="flex items-center gap-3 mt-3 w-full max-w-[360px] justify-between">
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-950 underline underline-offset-4 transition cursor-pointer"
                >
                  Cargar cuenta demo
                </button>
                <Link to="/" className="aux-link">
                  <ArrowLeft className="w-3 h-3 stroke-[1.75]" />
                  <span>Volver a la tienda</span>
                </Link>
              </div>
            </form>

            {/* Formulario 2: Crear Cuenta (Sign Up) */}
            <form className="sign-up-form" onSubmit={handleSignUpSubmit}>
              <h2 className="title">Crear Cuenta</h2>
              <p className="subtitle">Regístrate para despachos y recetas</p>

              <div className="input-field">
                <span className="input-icon-box">
                  <User className="w-4 h-4 stroke-[1.75]" />
                </span>
                <input
                  type="text"
                  placeholder="Nombres y Apellidos"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  required
                />
              </div>

              <div className="input-field">
                <span className="input-icon-box">
                  <CreditCard className="w-4 h-4 stroke-[1.75]" />
                </span>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="DNI (8 dígitos)"
                  value={registerData.dni}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, dni: e.target.value.replace(/\D/g, "") })
                  }
                  required
                />
              </div>

              <div className="input-field">
                <span className="input-icon-box">
                  <Phone className="w-4 h-4 stroke-[1.75]" />
                </span>
                <input
                  type="tel"
                  maxLength={9}
                  placeholder="Celular / WhatsApp"
                  value={registerData.phone}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, phone: e.target.value.replace(/\D/g, "") })
                  }
                  required
                />
              </div>

              <div className="input-field">
                <span className="input-icon-box">
                  <Mail className="w-4 h-4 stroke-[1.75]" />
                </span>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                />
              </div>

              <div className="input-field">
                <span className="input-icon-box">
                  <Lock className="w-4 h-4 stroke-[1.75]" />
                </span>
                <input
                  type="password"
                  placeholder="Contraseña (mínimo 6 car.)"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn">
                <span>Registrarme Gratis</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              <Link to="/" className="aux-link">
                <ArrowLeft className="w-3 h-3 stroke-[1.75]" />
                <span>Volver a la tienda</span>
              </Link>
            </form>
          </div>
        </div>

        {/* Paneles de Contenido Informativo con la Animación Original del Prompt */}
        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <span className="brand-badge">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[1.75]" />
                Botica Nova Salud
              </span>
              <h3>¿Primera vez aquí?</h3>
              <p>
                Crea tu cuenta de cliente en segundos. Disfruta de compras directas,
                trazabilidad de pedidos y asesoría farmacéutica personalizada.
              </p>
              <button
                type="button"
                className="btn transparent"
                onClick={() => setIsSignUp(true)}
              >
                Crear Cuenta
              </button>
            </div>

            {/* Doctora orientada mirando a la derecha, hacia el formulario de login */}
            <img
              src="/media/doctora-signin.png"
              className="image"
              alt="Doctora Farmacéutica - Botica Nova Salud"
            />
          </div>

          <div className="panel right-panel">
            <div className="content">
              <span className="brand-badge">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.75]" />
                Clientes Frecuentes
              </span>
              <h3>¿Ya tienes cuenta?</h3>
              <p>
                Inicia sesión para revisar tus recetas registradas, historial de boletas
                y el estado de tu despacho a domicilio.
              </p>
              <button
                type="button"
                className="btn transparent"
                onClick={() => setIsSignUp(false)}
              >
                Iniciar Sesión
              </button>
            </div>

            {/* Doctora orientada mirando a la izquierda, hacia el formulario de registro */}
            <img
              src="/media/doctora-signup.png"
              className="image"
              alt="Doctora Farmacéutica - Botica Nova Salud"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
