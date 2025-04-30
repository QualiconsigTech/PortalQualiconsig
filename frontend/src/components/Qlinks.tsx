"use client";

import React, { useState } from "react";

interface LinkItem {
  titulo: string;
  url: string;
}

const links: LinkItem[] = [
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
  { titulo: "QualiBanking", url: "https://quali.joinbank.com.br/sign-in?redirectURL=%2Fmain" },
  { titulo: "Inbursa", url: "https://www.inbursa.com.br/portalvendas/Login" },
  { titulo: "Inbursa Refin", url: "https://www.inbursa.com.br/PortalRefin/Home" },
  { titulo: "Banco Master", url: "https://autenticacao.bancomaster.com.br/login" },
  { titulo: "PagSeguro", url: "https://wss.credisim.com.br/BSGWEBSITES/WebAutorizador/Login/AC.UI.LOGIN.aspx?FISession=cc1554cbdbd" },
  { titulo: "Safra", url: "https://epfweb.safra.com.br/Home/Login" },
  { titulo: "C6", url: "https://c6.c6consig.com.br/WebAutorizador/Login/AC.UI.LOGIN.aspx?FISession=d8bb489375" },
  { titulo: "Crefisa", url: "https://sfc.sistemascr.com.br/autorizador/Login/AC.UI.LOGIN.aspx?FISession=9ddbbb4dcee" },
  { titulo: "Banrisul", url: "https://bemweb.bempromotora.com.br/autenticacao/login" },
  { titulo: "BMG", url: "https://www.bmgconsig.com.br/Index.do?method=prepare" },
  { titulo: "Facta", url: "https://desenv.facta.com.br/sistemaNovo/login.php" },
  { titulo: "Icred", url: "https://corban.icred.digital/login" },
  { titulo: "Itaú Consignado", url: "https://www.ibconsigweb.com.br/Index.do?method=prepare" },
  { titulo: "Pan Autorizador", url: "https://accounts-sso.bancopan.com.br/auth/realms/pan-parceiros/protocol/openid-connect/auth?client_id=pancred-fimenu&redirect_uri=https%3A%2F%2Fpanconsig.pansolucoes.com.br%2FFIMENU%2Fsignin-oidc&response_type=code&scope=openid%20profile&state=OpenIdConnect.AuthenticationProperties%3DL5mbN6UBXxehcQ4iIj_BQtEUwlYtTQct8ngobxJZfkFfLIgHehtlKrNOJ_P2QR40RMlxGwEp-DV0yqHVpeX0Cvn4yEyTVw9R1WqKXB3jEy1zx9-3gbQz12AY4UNcTpW-SCidGB_DjSHq9KKMsfmrCpOClgM0k9nKs0CddCQiplGHRpMzrMeQjZkRfL0odKxfQjKoXW2pppQEc43qnmWQ4g&response_mode=form_post&nonce=638533058299671336.N2I3MTEzYTEtNGM1Ni00MTNmLWJkNjctZmI2YWVhY2M3YWEyYmExMTg2N2YtMjZjYi00ODE0LTkwMzAtMDk0ZWYyNGU2Yzg4&x-client-SKU=ID_NET461&x-client-ver=5.3.0.0" },
  { titulo: "Daycoval", url: "https://portaldecredito.daycoval.com.br/login" },
  { titulo: "OLE", url: "https://ola.oleconsignado.com.br/" },
];

const QLinks: React.FC = () => {
  const [aberto, setAberto] = useState<number | null>(null);

  const toggle = (index: number) => {
    setAberto(aberto === index ? null : index);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Acessos Rápidos</h1>
      <p className="mb-6 text-gray-600">Clique em uma seção para expandir e acessar os links:</p>

      <div className="space-y-4">
        {/* Links gerais */}
        {links.map((link, index) => (
          <div key={index} className="border rounded-lg shadow-sm">
            <button
              className="w-full text-left px-4 py-3 font-semibold bg-gray-100 hover:bg-gray-200 transition"
              onClick={() => toggle(index)}
            >
              {link.titulo}
            </button>
            {aberto === index && (
              <div className="p-4 bg-white text-blue-600 font-medium">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Acessar {link.titulo}
                </a>
              </div>
            )}
          </div>
        ))}

        {/* Seção única para bancos */}
        <div className="border rounded-lg shadow-sm">
          <button
            className="w-full text-left px-4 py-3 font-semibold bg-gray-100 hover:bg-gray-200 transition"
            onClick={() => toggle(links.length)} // índice após o último link
          >
            Bancos
          </button>
          {aberto === links.length && (
            <div className="p-4 bg-white space-y-2">
              {bancos.map((banco, i) => (
                <div key={i} className="text-blue-600 font-medium">
                  <a href={banco.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {banco.titulo}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default QLinks;
