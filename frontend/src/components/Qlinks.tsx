"use client";

import React, { useState } from "react";

interface LinkItem {
  titulo: string;
  url: string;
  logo?: string; // Caminho relativo à pasta /public/images
}

const linksForaBancos: LinkItem[] = [
  { titulo: "QUALISYSTEM", url: "https://new.matriz-qualisystem.com.br/login" },
  { titulo: "VANGUARD", url: "https://gestao.sistemacorban.com.br/index.php" },
  { titulo: "APDATA", url: "https://cliente.apdata.com.br/qualiconsig/" },
  { titulo: "QUALIBANKING SAC", url: "http://200.155.66.47:16891/" },
  { titulo: "PÉ DE PANO", url: "https://clothfoot.com/login" },
  { titulo: "QCONSULT", url: "http://192.168.4.36:6262/" },
  { titulo: "BANCO CENTRAL", url: "https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormFinanciamentoPrestacoesFixas.do?method=exibirFormFinanciamentoPrestacoesFixas" },
  { titulo: "QSAR", url: "http://192.168.4.42/qsar/" },
  { titulo: "WINTERS GERAL", url: "https://winters-uypk.vercel.app/" },
];

const bancos: LinkItem[] = [
  { titulo: "QualiBanking", url: "https://quali.joinbank.com.br/sign-in?redirectURL=%2Fmain", logo: "/images/qualibanking.png" },
  { titulo: "Inbursa", url: "https://www.inbursa.com.br/portalvendas/Login", logo: "/images/inbursa.png" },
  { titulo: "Inbursa Refin", url: "https://www.inbursa.com.br/PortalRefin/Home", logo: "/images/inbursa-refin.png" },
  { titulo: "Banco Master", url: "https://autenticacao.bancomaster.com.br/login", logo: "/images/master.png" },
  { titulo: "PagSeguro", url: "https://wss.credisim.com.br/BSGWEBSITES/WebAutorizador/Login/AC.UI.LOGIN.aspx?FISession=cc1554cbdbd", logo: "/images/pagseguro.png" },
  { titulo: "Safra", url: "https://epfweb.safra.com.br/Home/Login", logo: "/images/safra.png" },
  { titulo: "C6", url: "https://c6.c6consig.com.br/WebAutorizador/Login/AC.UI.LOGIN.aspx?FISession=d8bb489375", logo: "/images/c6.png" },
  { titulo: "Crefisa", url: "https://sfc.sistemascr.com.br/autorizador/Login/AC.UI.LOGIN.aspx?FISession=9ddbbb4dcee", logo: "/images/crefisa.png" },
  { titulo: "Banrisul", url: "https://bemweb.bempromotora.com.br/autenticacao/login", logo: "/images/banrisul.png" },
  { titulo: "BMG", url: "https://www.bmgconsig.com.br/Index.do?method=prepare", logo: "/images/bmg.png" },
  { titulo: "Facta", url: "https://desenv.facta.com.br/sistemaNovo/login.php", logo: "/images/facta.png" },
  { titulo: "Icred", url: "https://corban.icred.digital/login", logo: "/images/icred.png" },
  { titulo: "Itaú Consignado", url: "https://www.ibconsigweb.com.br/Index.do?method=prepare", logo: "/images/itau.png" },
  { titulo: "Pan Autorizador", url: "https://accounts-sso.bancopan.com.br/auth/realms/...etc", logo: "/images/pan.png" },
  { titulo: "Daycoval", url: "https://portaldecredito.daycoval.com.br/login", logo: "/images/daycoval.png" },
  { titulo: "OLE", url: "https://ola.oleconsignado.com.br/", logo: "/images/ole.png" },
];

const Qlinks: React.FC = () => {
  const [abertoBancos, setAbertoBancos] = useState<boolean>(false);
  const [abertoForaBancos, setAbertoForaBancos] = useState<boolean>(false);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">QLinks</h1>
      <p className="mb-6 text-gray-600">Acesse rapidamente os sistemas:</p>

      {/* Seção Sistemas Gerais */}
      <div className="border rounded-lg shadow-sm mb-4">
        <button
          className="w-full text-left px-4 py-3 font-semibold bg-gray-100 hover:bg-gray-200 transition flex justify-between items-center"
          onClick={() => setAbertoForaBancos((prev) => !prev)}
        >
          <span>Sistemas Gerais</span>
          <span>{abertoForaBancos ? "▲" : "▼"}</span>
        </button>
        {abertoForaBancos && (
         <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white">
            {linksForaBancos.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center text-center px-4 py-6 border rounded-lg bg-gray-50 hover:bg-gray-100 transition font-medium text-[#041161]"
              >
                {link.titulo}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Seção Bancos */}
      <div className="border rounded-lg shadow-sm mb-4">
        <button
          className="w-full text-left px-4 py-3 font-semibold bg-gray-100 hover:bg-gray-200 transition flex justify-between items-center"
          onClick={() => setAbertoBancos((prev) => !prev)}
        >
          <span>Bancos</span>
          <span>{abertoBancos ? "▲" : "▼"}</span>
        </button>
        {abertoBancos && (
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white">
            {bancos.map((banco, index) => (
              <a
                key={index}
                href={banco.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center border rounded-lg p-3 hover:shadow transition"
              >
                <img
                  src={banco.logo}
                  alt={banco.titulo}
                  className="max-h-12 object-contain"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Qlinks;
