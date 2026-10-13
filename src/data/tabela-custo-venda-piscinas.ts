export interface ItemCustoVendaPiscina {
  id: string;
  modelo: string;
  linha:
    | "Italiana"
    | "Trad"
    | "Tropical"
    | "Farol"
    | "Cancún"
    | "Bonaire"
    | "Tortuga"
    | "Atalaia"
    | "Nassau"
    | "Navagio / Porcelana";
  custo_casco: number;
  custo_filtro: number;
  frete: number;
  instalacao: number;
  imposto: number;
  lucro: number;
  preco_venda: number;
  observacao?: string;
}

export const LINHAS_CUSTO_VENDA_PISCINAS = [
  "Italiana",
  "Trad",
  "Tropical",
  "Farol",
  "Cancún",
  "Bonaire",
  "Tortuga",
  "Atalaia",
  "Nassau",
  "Navagio / Porcelana",
] as const;

export const NOTA_PORCELANA_POR_LINHA: Partial<Record<ItemCustoVendaPiscina["linha"], string>> = {
  Trad: "* não incluso a porcelana",
  Bonaire: "* não incluso a porcelana",
  Tortuga: "* não incluso a porcelana",
  Atalaia: "* não incluso a porcelana",
  Nassau: "* não incluso a porcelana",
  "Navagio / Porcelana": "* incluso a porcelana",
};

export const TABELA_CUSTO_VENDA_PISCINAS: ItemCustoVendaPiscina[] = [
  // ================= ITALIANA =================
  { id: "cv-ita-3", modelo: "Italiana 3", linha: "Italiana", custo_casco: 2491, custo_filtro: 2600, frete: 275, instalacao: 900, imposto: 215, lucro: 3500, preco_venda: 9981 },
  { id: "cv-ita-32", modelo: "Italiana 3,2", linha: "Italiana", custo_casco: 4484, custo_filtro: 2600, frete: 330, instalacao: 960, imposto: 275, lucro: 4000, preco_venda: 12649 },
  { id: "cv-ita-35", modelo: "Italiana 3,5", linha: "Italiana", custo_casco: 3487, custo_filtro: 2600, frete: 440, instalacao: 1050, imposto: 260, lucro: 4000, preco_venda: 11837 },
  { id: "cv-ita-4", modelo: "Italiana 4", linha: "Italiana", custo_casco: 5875, custo_filtro: 2600, frete: 495, instalacao: 1200, imposto: 325, lucro: 4000, preco_venda: 14495 },
  { id: "cv-ita-5", modelo: "Italiana 5", linha: "Italiana", custo_casco: 7969, custo_filtro: 2600, frete: 550, instalacao: 1500, imposto: 400, lucro: 4500, preco_venda: 17519 },
  { id: "cv-ita-6", modelo: "Italiana 6", linha: "Italiana", custo_casco: 10160, custo_filtro: 2600, frete: 605, instalacao: 1800, imposto: 475, lucro: 5000, preco_venda: 20640 },
  { id: "cv-ita-7", modelo: "Italiana 7", linha: "Italiana", custo_casco: 13345, custo_filtro: 2600, frete: 660, instalacao: 2100, imposto: 595, lucro: 6000, preco_venda: 25300 },
  { id: "cv-ita-8", modelo: "Italiana 8", linha: "Italiana", custo_casco: 16037, custo_filtro: 2600, frete: 715, instalacao: 2400, imposto: 685, lucro: 7000, preco_venda: 29437 },

  // ================= TRAD (* não incluso a porcelana) =================
  { id: "cv-trad-35", modelo: "Trad 3,5", linha: "Trad", custo_casco: 4284, custo_filtro: 2600, frete: 440, instalacao: 1050, imposto: 280, lucro: 4000, preco_venda: 12654, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-35-140", modelo: "Trad 3,5 c/ 1,40", linha: "Trad", custo_casco: 4982, custo_filtro: 2600, frete: 440, instalacao: 1050, imposto: 280, lucro: 4000, preco_venda: 13352, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-4", modelo: "Trad 4", linha: "Trad", custo_casco: 4983, custo_filtro: 2600, frete: 495, instalacao: 1200, imposto: 300, lucro: 4000, preco_venda: 13578, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-4-140", modelo: "Trad 4 c/ 1,40", linha: "Trad", custo_casco: 5977, custo_filtro: 2600, frete: 495, instalacao: 1200, imposto: 325, lucro: 4000, preco_venda: 14597, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-45", modelo: "Trad 4,5", linha: "Trad", custo_casco: 5977, custo_filtro: 2600, frete: 495, instalacao: 1350, imposto: 330, lucro: 4000, preco_venda: 14752, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-5", modelo: "Trad 5", linha: "Trad", custo_casco: 7671, custo_filtro: 2600, frete: 550, instalacao: 1500, imposto: 390, lucro: 4500, preco_venda: 17211, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-5-140", modelo: "Trad 5 c/ 1,40", linha: "Trad", custo_casco: 8468, custo_filtro: 2600, frete: 550, instalacao: 1500, imposto: 410, lucro: 4500, preco_venda: 18028, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-55", modelo: "Trad 5,5", linha: "Trad", custo_casco: 9066, custo_filtro: 2600, frete: 550, instalacao: 1650, imposto: 425, lucro: 4500, preco_venda: 18791, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-6", modelo: "Trad 6", linha: "Trad", custo_casco: 10461, custo_filtro: 2600, frete: 605, instalacao: 1800, imposto: 480, lucro: 5000, preco_venda: 20946, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-6-prainha", modelo: "Trad 6 Prainha", linha: "Trad", custo_casco: 9962, custo_filtro: 2600, frete: 605, instalacao: 1800, imposto: 470, lucro: 5000, preco_venda: 20437, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-6-spa", modelo: "Trad 6 Spa", linha: "Trad", custo_casco: 11556, custo_filtro: 2600, frete: 605, instalacao: 1800, imposto: 505, lucro: 5000, preco_venda: 22066, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-65", modelo: "Trad 6,5", linha: "Trad", custo_casco: 11754, custo_filtro: 2600, frete: 605, instalacao: 1950, imposto: 515, lucro: 5000, preco_venda: 22424, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-7", modelo: "Trad 7", linha: "Trad", custo_casco: 12953, custo_filtro: 2600, frete: 660, instalacao: 2100, imposto: 575, lucro: 6000, preco_venda: 24888, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-7-prainha", modelo: "Trad 7 Prainha", linha: "Trad", custo_casco: 12553, custo_filtro: 2600, frete: 660, instalacao: 2100, imposto: 565, lucro: 6000, preco_venda: 24478, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-7-spa", modelo: "Trad 7 Spa", linha: "Trad", custo_casco: 14944, custo_filtro: 2600, frete: 660, instalacao: 2100, imposto: 625, lucro: 6000, preco_venda: 26929, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-75", modelo: "Trad 7,5", linha: "Trad", custo_casco: 14447, custo_filtro: 2600, frete: 660, instalacao: 2250, imposto: 615, lucro: 6000, preco_venda: 26572, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-8", modelo: "Trad 8", linha: "Trad", custo_casco: 15938, custo_filtro: 2600, frete: 715, instalacao: 2400, imposto: 685, lucro: 7000, preco_venda: 29338, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-8-prainha", modelo: "Trad 8 Prainha", linha: "Trad", custo_casco: 15143, custo_filtro: 2600, frete: 715, instalacao: 2400, imposto: 665, lucro: 7000, preco_venda: 28523, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-8-spa", modelo: "Trad 8 Spa", linha: "Trad", custo_casco: 18331, custo_filtro: 2600, frete: 715, instalacao: 2400, imposto: 745, lucro: 7000, preco_venda: 31791, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-85", modelo: "Trad 8,5", linha: "Trad", custo_casco: 17831, custo_filtro: 2600, frete: 715, instalacao: 2550, imposto: 735, lucro: 7000, preco_venda: 31431, observacao: "* não incluso a porcelana" },
  { id: "cv-trad-9", modelo: "Trad 9", linha: "Trad", custo_casco: 20523, custo_filtro: 2600, frete: 770, instalacao: 2700, imposto: 805, lucro: 7000, preco_venda: 34398, observacao: "* não incluso a porcelana" },

  // ================= TROPICAL =================
  { id: "cv-tro-35", modelo: "Tropical 3,5", linha: "Tropical", custo_casco: 3186, custo_filtro: 2600, frete: 440, instalacao: 1050, imposto: 255, lucro: 4000, preco_venda: 11531 },
  { id: "cv-tro-4", modelo: "Tropical 4", linha: "Tropical", custo_casco: 4181, custo_filtro: 2600, frete: 495, instalacao: 1200, imposto: 280, lucro: 4000, preco_venda: 12756 },
  { id: "cv-tro-4-140", modelo: "Tropical 4 c/ 1,40", linha: "Tropical", custo_casco: 5478, custo_filtro: 2600, frete: 495, instalacao: 1200, imposto: 315, lucro: 4000, preco_venda: 14088 },
  { id: "cv-tro-5", modelo: "Tropical 5", linha: "Tropical", custo_casco: 6972, custo_filtro: 2600, frete: 550, instalacao: 1500, imposto: 360, lucro: 4500, preco_venda: 16482 },
  { id: "cv-tro-6", modelo: "Tropical 6", linha: "Tropical", custo_casco: 8667, custo_filtro: 2600, frete: 605, instalacao: 1800, imposto: 435, lucro: 5000, preco_venda: 19107 },
  { id: "cv-tro-6-140", modelo: "Tropical 6 c/ 1,40", linha: "Tropical", custo_casco: 8965, custo_filtro: 2600, frete: 605, instalacao: 1800, imposto: 445, lucro: 5000, preco_venda: 19415 },
  { id: "cv-tro-7", modelo: "Tropical 7", linha: "Tropical", custo_casco: 11655, custo_filtro: 2600, frete: 660, instalacao: 2100, imposto: 525, lucro: 6000, preco_venda: 23540 },
  { id: "cv-tro-8", modelo: "Tropical 8", linha: "Tropical", custo_casco: 14345, custo_filtro: 2600, frete: 715, instalacao: 2400, imposto: 625, lucro: 7000, preco_venda: 27685 },
  { id: "cv-tro-9", modelo: "Tropical 9", linha: "Tropical", custo_casco: 17533, custo_filtro: 2600, frete: 770, instalacao: 2700, imposto: 710, lucro: 7000, preco_venda: 31313 },
  { id: "cv-tro-10", modelo: "Tropical 10", linha: "Tropical", custo_casco: 21716, custo_filtro: 2600, frete: 825, instalacao: 3000, imposto: 830, lucro: 7500, preco_venda: 36471 },

  // ================= FAROL =================
  { id: "cv-far-4", modelo: "Farol 4", linha: "Farol", custo_casco: 5777, custo_filtro: 2600, frete: 495, instalacao: 1200, imposto: 320, lucro: 4000, preco_venda: 14392 },
  { id: "cv-far-5", modelo: "Farol 5", linha: "Farol", custo_casco: 8168, custo_filtro: 2600, frete: 550, instalacao: 1500, imposto: 400, lucro: 4500, preco_venda: 17718 },
  { id: "cv-far-6", modelo: "Farol 6", linha: "Farol", custo_casco: 10460, custo_filtro: 2600, frete: 605, instalacao: 1800, imposto: 480, lucro: 5000, preco_venda: 20945 },
  { id: "cv-far-7", modelo: "Farol 7", linha: "Farol", custo_casco: 14644, custo_filtro: 2600, frete: 660, instalacao: 2100, imposto: 615, lucro: 6000, preco_venda: 26619 },
  { id: "cv-far-8", modelo: "Farol 8", linha: "Farol", custo_casco: 17732, custo_filtro: 2600, frete: 715, instalacao: 2400, imposto: 730, lucro: 7000, preco_venda: 31177 },
  { id: "cv-far-9", modelo: "Farol 9", linha: "Farol", custo_casco: 20820, custo_filtro: 2600, frete: 770, instalacao: 2700, imposto: 815, lucro: 7000, preco_venda: 34705 },
  { id: "cv-far-10", modelo: "Farol 10", linha: "Farol", custo_casco: 26896, custo_filtro: 2600, frete: 825, instalacao: 3000, imposto: 985, lucro: 7500, preco_venda: 41806 },

  // ================= CANCÚN =================
  { id: "cv-can-3", modelo: "Cancún 3", linha: "Cancún", custo_casco: 3984, custo_filtro: 2600, frete: 275, instalacao: 900, imposto: 265, lucro: 4000, preco_venda: 12024 },
  { id: "cv-can-8", modelo: "Cancún 8", linha: "Cancún", custo_casco: 20721, custo_filtro: 2600, frete: 715, instalacao: 2400, imposto: 805, lucro: 7000, preco_venda: 34241 },
  { id: "cv-can-10", modelo: "Cancún 10", linha: "Cancún", custo_casco: 27893, custo_filtro: 2600, frete: 825, instalacao: 3000, imposto: 995, lucro: 7500, preco_venda: 42813 },

  // ================= BONAIRE (* não incluso a porcelana) =================
  { id: "cv-bon-3", modelo: "Bonaire 3", linha: "Bonaire", custo_casco: 4881, custo_filtro: 2600, frete: 275, instalacao: 900, imposto: 285, lucro: 4000, preco_venda: 12941, observacao: "* não incluso a porcelana" },
  { id: "cv-bon-4", modelo: "Bonaire 4", linha: "Bonaire", custo_casco: 6475, custo_filtro: 2600, frete: 495, instalacao: 1200, imposto: 340, lucro: 4000, preco_venda: 15110, observacao: "* não incluso a porcelana" },
  { id: "cv-bon-5", modelo: "Bonaire 5", linha: "Bonaire", custo_casco: 9662, custo_filtro: 2600, frete: 550, instalacao: 1500, imposto: 440, lucro: 4500, preco_venda: 19252, observacao: "* não incluso a porcelana" },
  { id: "cv-bon-6", modelo: "Bonaire 6", linha: "Bonaire", custo_casco: 12253, custo_filtro: 2600, frete: 605, instalacao: 1800, imposto: 525, lucro: 5000, preco_venda: 22783, observacao: "* não incluso a porcelana" },
  { id: "cv-bon-7", modelo: "Bonaire 7", linha: "Bonaire", custo_casco: 17432, custo_filtro: 2600, frete: 660, instalacao: 2100, imposto: 685, lucro: 6000, preco_venda: 29477, observacao: "* não incluso a porcelana" },
  { id: "cv-bon-8", modelo: "Bonaire 8", linha: "Bonaire", custo_casco: 21119, custo_filtro: 2600, frete: 715, instalacao: 2400, imposto: 810, lucro: 7000, preco_venda: 34644, observacao: "* não incluso a porcelana" },

  // ================= TORTUGA (* não incluso a porcelana) =================
  { id: "cv-tor-5", modelo: "Tortuga 5", linha: "Tortuga", custo_casco: 8068, custo_filtro: 2600, frete: 550, instalacao: 1500, imposto: 400, lucro: 4500, preco_venda: 17618, observacao: "* não incluso a porcelana" },
  { id: "cv-tor-7", modelo: "Tortuga 7", linha: "Tortuga", custo_casco: 15340, custo_filtro: 2600, frete: 660, instalacao: 2100, imposto: 635, lucro: 6000, preco_venda: 27335, observacao: "* não incluso a porcelana" },
  { id: "cv-tor-9", modelo: "Tortuga 9", linha: "Tortuga", custo_casco: 18628, custo_filtro: 2600, frete: 770, instalacao: 2700, imposto: 760, lucro: 7000, preco_venda: 32458, observacao: "* não incluso a porcelana" },
  { id: "cv-tor-10", modelo: "Tortuga 10", linha: "Tortuga", custo_casco: 24904, custo_filtro: 2600, frete: 825, instalacao: 3000, imposto: 935, lucro: 7500, preco_venda: 39764, observacao: "* não incluso a porcelana" },

  // ================= ATALAIA (* não incluso a porcelana) =================
  { id: "cv-ata-7", modelo: "Atalaia 7", linha: "Atalaia", custo_casco: 19923, custo_filtro: 2600, frete: 660, instalacao: 2100, imposto: 750, lucro: 6000, preco_venda: 32033, observacao: "* não incluso a porcelana" },
  { id: "cv-ata-9", modelo: "Atalaia 9", linha: "Atalaia", custo_casco: 27495, custo_filtro: 2600, frete: 770, instalacao: 2700, imposto: 980, lucro: 7000, preco_venda: 41545, observacao: "* não incluso a porcelana" },

  // ================= NASSAU (* não incluso a porcelana) =================
  { id: "cv-nas-4", modelo: "Nassau 4", linha: "Nassau", custo_casco: 8866, custo_filtro: 2600, frete: 495, instalacao: 1200, imposto: 400, lucro: 4000, preco_venda: 17561, observacao: "* não incluso a porcelana" },

  // ================= MODELO / PORCELANA (NAVAGIO) (* incluso a porcelana) =================
  { id: "cv-nav-3", modelo: "Navagio 3", linha: "Navagio / Porcelana", custo_casco: 6468, custo_filtro: 2600, frete: 440, instalacao: 960, imposto: 340, lucro: 4000, preco_venda: 14808, observacao: "* incluso a porcelana" },
  { id: "cv-nav-3-acr", modelo: "Navagio 3 acrílico 1,5m", linha: "Navagio / Porcelana", custo_casco: 9573, custo_filtro: 2600, frete: 440, instalacao: 960, imposto: 420, lucro: 5500, preco_venda: 19493, observacao: "* incluso a porcelana" },
  { id: "cv-nav-3-acrl", modelo: "Navagio 3 acrílico L 1,5m", linha: "Navagio / Porcelana", custo_casco: 11126, custo_filtro: 2600, frete: 440, instalacao: 960, imposto: 455, lucro: 5500, preco_venda: 21081, observacao: "* incluso a porcelana" },
  { id: "cv-nav-3-14", modelo: "Navagio 3 c/ 1,4", linha: "Navagio / Porcelana", custo_casco: 8066, custo_filtro: 2600, frete: 440, instalacao: 960, imposto: 375, lucro: 4000, preco_venda: 16441, observacao: "* incluso a porcelana" },
  { id: "cv-nav-3-14-acr", modelo: "Navagio 3 c/ 1,4 acrílico 1,5m", linha: "Navagio / Porcelana", custo_casco: 11171, custo_filtro: 2600, frete: 440, instalacao: 960, imposto: 490, lucro: 5500, preco_venda: 21161, observacao: "* incluso a porcelana" },
  { id: "cv-nav-3-14-acrl", modelo: "Navagio 3 c/ 1,4 acrílico L 1,5m", linha: "Navagio / Porcelana", custo_casco: 12723, custo_filtro: 2600, frete: 440, instalacao: 960, imposto: 525, lucro: 5500, preco_venda: 22748, observacao: "* incluso a porcelana" },
  { id: "cv-ni-2x180", modelo: "NI 2 x 1,80 c/ 0,86", linha: "Navagio / Porcelana", custo_casco: 4565, custo_filtro: 2600, frete: 440, instalacao: 960, imposto: 335, lucro: 4500, preco_venda: 13400, observacao: "* incluso a porcelana" },
  { id: "cv-ni-2x180-acr", modelo: "NI 2 x 1,80 c/ 0,86 / acrílico", linha: "Navagio / Porcelana", custo_casco: 7670, custo_filtro: 2600, frete: 440, instalacao: 960, imposto: 415, lucro: 4500, preco_venda: 16585, observacao: "* incluso a porcelana" },
  { id: "cv-nii-250x170", modelo: "NII 2,50 x 1,70 c/ 0,86", linha: "Navagio / Porcelana", custo_casco: 5160, custo_filtro: 2600, frete: 440, instalacao: 960, imposto: 315, lucro: 3000, preco_venda: 12475, observacao: "* incluso a porcelana" },
  { id: "cv-nii-250x170-acr", modelo: "NII 2,50 x 1,70 c/ 0,86 / acrílico", linha: "Navagio / Porcelana", custo_casco: 8265, custo_filtro: 2600, frete: 440, instalacao: 960, imposto: 430, lucro: 4500, preco_venda: 17195, observacao: "* incluso a porcelana" },
  { id: "cv-niii-250x180", modelo: "NIII 2,50 x 1,80 c/ 0,86", linha: "Navagio / Porcelana", custo_casco: 5174, custo_filtro: 2600, frete: 440, instalacao: 960, imposto: 315, lucro: 3000, preco_venda: 12489, observacao: "* incluso a porcelana" },
  { id: "cv-niii-250x180-acr", modelo: "NIII 2,50 x 1,80 c/ 0,86 / acrílico", linha: "Navagio / Porcelana", custo_casco: 8279, custo_filtro: 2600, frete: 440, instalacao: 960, imposto: 430, lucro: 4500, preco_venda: 17209, observacao: "* incluso a porcelana" },
  { id: "cv-niv-3x2", modelo: "NIV 3 x 2 c/ 0,86", linha: "Navagio / Porcelana", custo_casco: 5841, custo_filtro: 2600, frete: 440, instalacao: 960, imposto: 345, lucro: 3500, preco_venda: 13686, observacao: "* incluso a porcelana" },
  { id: "cv-niv-3x2-acr", modelo: "NIV 3 x 2 c/ 0,86 / acrílico", linha: "Navagio / Porcelana", custo_casco: 8946, custo_filtro: 2600, frete: 440, instalacao: 960, imposto: 460, lucro: 5000, preco_venda: 18406, observacao: "* incluso a porcelana" },
  { id: "cv-nv-2x2-acr-curva", modelo: "NV 2 x 2 c/ 0,86 / acrílico curva", linha: "Navagio / Porcelana", custo_casco: 9588, custo_filtro: 2600, frete: 440, instalacao: 960, imposto: 450, lucro: 4500, preco_venda: 18538, observacao: "* incluso a porcelana" },
];
