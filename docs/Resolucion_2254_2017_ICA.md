# 📊 Metodología de Cálculo del ICA en Colombia (Resolución 2254 de 2017)

El Índice de Calidad del Aire (ICA) en Colombia se rige por la **Resolución 2254 del 1 de noviembre de 2017** expedida por el Ministerio de Ambiente y Desarrollo Sostenible.

---

## 1. Fórmula Matemática de Interpolación Lineal por Tramos

$$I_p = \frac{I_{hi} - I_{lo}}{BP_{hi} - BP_{lo}} \cdot (C_p - BP_{lo}) + I_{lo}$$

Donde:
* $I_p$: Índice de Calidad del Aire para el contaminante $p$ ($PM_{2.5}$).
* $C_p$: Concentración observada del contaminante en $\mu g/m^3$ (redondeada a un decimal).
* $BP_{hi}$: Punto de corte superior del rango donde se ubica $C_p$.
* $BP_{lo}$: Punto de corte inferior del rango donde se ubica $C_p$.
* $I_{hi}$: Valor del ICA correspondiente a $BP_{hi}$.
* $I_{lo}$: Valor del ICA correspondiente a $BP_{lo}$.

---

## 2. Puntos de Corte para Material Particulado Fino ($PM_{2.5}$ - Promedio 24 Horas)

| Rango Concentración $C_p$ ($\mu g/m^3$) | Rango ICA ($I_{lo} - I_{hi}$) | Categoría de Calidad del Aire | Color Oficial | Significado para la Salud |
|---|---|---|---|---|
| **0.0 - 12.0** | **0 - 50** | **Buena** | 🟢 Verde | La calidad del aire se considera satisfactoria y no representa riesgo para la salud. |
| **12.1 - 37.0** | **51 - 100** | **Aceptable / Moderada** | 🟡 Amarillo | Calidad de aire aceptable; posible molestia leve para personas extraordinariamente sensibles. |
| **37.1 - 55.4** | **101 - 150** | **Dañina a la salud de grupos sensibles** | 🟠 Naranja | Niños, adultos mayores y personas con enfermedades respiratorias deben limitar esfuerzos prolongados. |
| **55.5 - 150.4** | **151 - 200** | **Dañina a la salud** | 🔴 Rojo | Todos pueden comenzar a experimentar efectos adversos en la salud. |
| **150.5 - 250.4** | **201 - 300** | **Muy Dañina a la salud** | 🟣 Morado | Alerta sanitaria general: la población general se ve afectada significativamente. |
| **≥ 250.5** | **≥ 301** | **Peligrosa** | 🟤 Marrón | Advertencia de emergencia de salud: toda la población corre peligro inminente. |

---

## 3. Implementación en Código Python / TypeScript

```typescript
export function calculatePM25ICA(concentration: number): number {
  if (concentration <= 0) return 0;
  if (concentration <= 12.0) {
    return Math.round(((50 - 0) / (12.0 - 0)) * (concentration - 0) + 0);
  }
  if (concentration <= 37.0) {
    return Math.round(((100 - 51) / (37.0 - 12.1)) * (concentration - 12.1) + 51);
  }
  if (concentration <= 55.4) {
    return Math.round(((150 - 101) / (55.4 - 37.1)) * (concentration - 37.1) + 101);
  }
  if (concentration <= 150.4) {
    return Math.round(((200 - 151) / (150.4 - 55.5)) * (concentration - 55.5) + 151);
  }
  if (concentration <= 250.4) {
    return Math.round(((300 - 201) / (250.4 - 150.5)) * (concentration - 150.5) + 201);
  }
  return Math.min(500, Math.round(((500 - 301) / (500.0 - 250.5)) * (concentration - 250.5) + 301));
}
```
