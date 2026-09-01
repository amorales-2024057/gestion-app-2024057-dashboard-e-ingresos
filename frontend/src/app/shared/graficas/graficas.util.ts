// graficas.util.ts
// Esto es el mismo dibujado de graficas que traia charts.js del maquetado,
// nada mas que ya pasado a TS y tipado. La idea es que construyen el SVG
// como string a partir de un arreglo de puntos {label, value}, calculando
// ejes y escalas solitas. No usan ninguna libreria de graficas, es SVG
// armado a mano igual que en el HTML original.

export interface PuntoGrafica {
    label: string;
    value: number;
}

interface MargenGrafica {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

/**
 * Dibuja la grafica de linea (usada para "Balance por año").
 * Recibe los puntos y el valor maximo del eje Y para poder acomodar
 * datos reales del backend mas adelante sin tener que tocar la escala
 * a mano cada vez.
 */
export function construirSvgLinea(
    datos: PuntoGrafica[],
    valorMaximo = 70000,
    pasoEje = 10000
): string {
    if (datos.length === 0) {
        return '';
    }

    const width = 640;
    const height = 260;
    const padding: MargenGrafica = { top: 10, right: 16, bottom: 26, left: 46 };
    const anchoGrafica = width - padding.left - padding.right;
    const altoGrafica = height - padding.top - padding.bottom;

    const cantidadPasos = Math.round(valorMaximo / pasoEje);

    const xEn = (indice: number): number =>
        padding.left + (indice / Math.max(datos.length - 1, 1)) * anchoGrafica;
    const yEn = (valor: number): number =>
        padding.top + altoGrafica - (valor / valorMaximo) * altoGrafica;

    let svgCuadricula = '';
    let svgEtiquetasY = '';
    for (let paso = 0; paso <= cantidadPasos; paso++) {
        const valor = paso * pasoEje;
        const y = yEn(valor);
        svgCuadricula += `<line class="grid-line" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" />`;
        svgEtiquetasY += `<text class="axis-label" x="${padding.left - 10}" y="${y + 4}" text-anchor="end">${valor.toLocaleString('es-GT')}</text>`;
    }

    let svgEtiquetasX = '';
    datos.forEach((punto, indice) => {
        svgEtiquetasX += `<text class="axis-label" x="${xEn(indice)}" y="${height - 6}" text-anchor="middle">${punto.label}</text>`;
    });

    const puntosLinea = datos.map((punto, indice) => `${xEn(indice)},${yEn(punto.value)}`).join(' ');
    const svgCirculos = datos
        .map((punto, indice) => `<circle cx="${xEn(indice)}" cy="${yEn(punto.value)}" r="3.5" fill="#0066ff" />`)
        .join('');

    return `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
      ${svgCuadricula}
      ${svgEtiquetasY}
      ${svgEtiquetasX}
      <polyline points="${puntosLinea}" fill="none" stroke="#0066ff" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
      ${svgCirculos}
    </svg>
  `;
}

/**
 * Dibuja la grafica de barras (usada para "balance mensual del usuario").
 * Acepta valores negativos porque un mes puede cerrar en rojo; la barra
 * se dibuja hacia abajo desde el cero en esos casos.
 */
export function construirSvgBarras(
    datos: PuntoGrafica[],
    valorMaximo = 150000,
    valorMinimo = -100000
): string {
    if (datos.length === 0) {
        return '';
    }

    const width = 400;
    const height = 260;
    const padding: MargenGrafica = { top: 10, right: 10, bottom: 46, left: 50 };
    const anchoGrafica = width - padding.left - padding.right;
    const altoGrafica = height - padding.top - padding.bottom;

    const rango = valorMaximo - valorMinimo;
    const yCero = padding.top + altoGrafica - ((0 - valorMinimo) / rango) * altoGrafica;

    const pasoEtiquetas = (valorMaximo - valorMinimo) / 5;
    const marcas: number[] = [];
    for (let i = 0; i <= 5; i++) {
        marcas.push(Math.round(valorMaximo - pasoEtiquetas * i));
    }

    let svgCuadricula = '';
    let svgEtiquetasY = '';
    marcas.forEach((valor) => {
        const y = padding.top + altoGrafica - ((valor - valorMinimo) / rango) * altoGrafica;
        svgCuadricula += `<line class="grid-line" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" />`;
        svgEtiquetasY += `<text class="axis-label" x="${padding.left - 8}" y="${y + 4}" text-anchor="end">${valor.toLocaleString('es-GT')}</text>`;
    });

    const anchoBanda = anchoGrafica / datos.length;
    const anchoBarra = anchoBanda * 0.42;

    let svgBarras = '';
    let svgEtiquetasX = '';
    datos.forEach((punto, indice) => {
        const centroBanda = padding.left + anchoBanda * indice + anchoBanda / 2;
        const yBarra =
            punto.value >= 0
                ? padding.top + altoGrafica - ((punto.value - valorMinimo) / rango) * altoGrafica
                : yCero;
        const altoBarra = Math.abs(
            ((punto.value - valorMinimo) / rango) * altoGrafica - ((0 - valorMinimo) / rango) * altoGrafica
        );
        const color = punto.value >= 0 ? (indice % 2 === 0 ? '#3b82f6' : '#0066ff') : '#0a1830';

        svgBarras += `<rect x="${centroBanda - anchoBarra / 2}" y="${yBarra}" width="${anchoBarra}" height="${Math.max(altoBarra, 1)}" rx="3" fill="${color}" />`;
        svgEtiquetasX += `<text class="axis-label" x="${centroBanda}" y="${height - 10}" text-anchor="middle" transform="rotate(-25 ${centroBanda} ${height - 10})">${punto.label}</text>`;
    });

    return `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
      ${svgCuadricula}
      ${svgEtiquetasY}
      ${svgBarras}
      ${svgEtiquetasX}
    </svg>
  `;
}
