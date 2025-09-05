# 🎯 Sistema de Gestión de Bingo

Sistema de gestión financiera para eventos de bingo locales desarrollado con Next.js y SQLite.

## 📋 Descripción

Esta aplicación permite gestionar de manera completa las rondas de bingo, incluyendo ventas de tablas, cálculo de premios, acumulados y estadísticas financieras. Diseñada para ser proyectada en pantallas grandes durante eventos.

## ✨ Características Principales

### 🎮 Gestión de Rondas
- **Estados de ronda**: Comenzando, En curso, Finalizada
- **Rondas finales**: Opción especial que incluye el acumulado total en el premio
- **Control único**: Solo una ronda puede estar "en curso" a la vez
- **Configuración flexible**: Porcentajes de premio y aporte al acumulado personalizables

### 💰 Gestión Financiera
- **Moneda**: Pesos Colombianos (COP) sin decimales
- **Métodos de pago**: Efectivo y Nequi únicamente
- **Cálculo automático**: Premios, acumulados y ganancias en tiempo real
- **Estadísticas**: Resumen financiero por ronda y global

### 🖥️ Interfaces
- **Página de inicio**: Lista de rondas y navegación
- **Administración**: Gestión completa de cada ronda
- **Página pública**: Información para proyección en pantalla grande
- **Estadísticas**: Análisis financiero con filtros por método de pago

### 🎨 Diseño
- **Tema semi-oscuro**: Paleta de colores moderna y profesional
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Animaciones**: Efectos sutiles para mejor experiencia visual
- **Proyección optimizada**: Página pública diseñada para pantallas grandes

## 🚀 Tecnologías

- **Frontend**: Next.js 15 con App Router
- **Base de datos**: SQLite con better-sqlite3
- **Estilos**: TailwindCSS
- **Lenguaje**: TypeScript
- **Validación**: Zod (tipos)

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

## 🗄️ Base de Datos

El sistema utiliza SQLite como base de datos local con las siguientes tablas:

- **rondas**: Información de cada ronda (nombre, precios, porcentajes, estado, es_final)
- **ventas**: Registro de ventas de tablas por ronda
- **acumulado**: Aportes al fondo acumulado por ronda
- **ganancias**: Registro de ganancias internas por ronda

## 🎯 Flujo de Trabajo

1. **Crear ronda**: Configurar nombre, precios y porcentajes
2. **Marcar como "en curso"**: Activar la ronda para ventas
3. **Registrar ventas**: Agregar ventas de tablas con método de pago
4. **Entregar premio**: Registrar el premio entregado al ganador
5. **Finalizar ronda**: Marcar como finalizada y ver estadísticas

## 📊 Páginas del Sistema

- **`/`**: Página de inicio con lista de rondas
- **`/rondas/nueva`**: Formulario para crear nuevas rondas
- **`/admin?rondaId=X`**: Administración de ronda específica
- **`/public`**: Página pública para proyección
- **`/stats`**: Estadísticas financieras con filtros

## 🔧 Configuración

El sistema se configura automáticamente al iniciar. La base de datos se crea y migra automáticamente en el primer uso.

## 📱 Uso en Eventos

- **Administración**: Usar en computadora para gestionar rondas
- **Proyección**: Usar `/public` en pantalla grande para mostrar información
- **Estadísticas**: Consultar `/stats` para análisis financiero

## 🎨 Personalización

- **Logos**: Reemplazar `logo.png` y `logo2.png` en la carpeta `public`
- **Colores**: Modificar variables CSS en `globals.css`
- **Configuración**: Ajustar porcentajes y precios por ronda

---

Desarrollado para gestión local de eventos de bingo con enfoque en simplicidad y usabilidad.