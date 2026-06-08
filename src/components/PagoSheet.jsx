"use client";
import { useState } from "react";
import { mesLabel }  from "../utils/format.js";

const FORMAS = ["Pix", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Dinheiro"];
const ICONES = { "Pix":"⚡", "Cartão de Crédito":"💳", "Cartão de Débito":"💳", "Boleto":"🧾", "Dinheiro":"💵" };

/**
 * Sheet de seleção de forma de pagamento.
 * Props: data { mes }, onClose, onConfirmar(formaPag)
 */
export default function PagoSheet({ data, onClose, onConfirmar }) {
  const [forma, setForma] = useState(FORMAS[0]);

  return (
    <div className="confirm" onClick={e => e.stopPropagation()} style={{ maxWidth:340 }}>
      <h4>Registrar Pagamento</h4>
      <p style={{ marginBottom:12 }}>Mensalidade de <strong>{mesLabel(data.mes)}</strong></p>
      <p style={{ fontSize:13, color:"var(--mu)", marginBottom:8 }}>Forma de pagamento:</p>

      <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
        {FORMAS.map(f => (
          <button
            key={f}
            onClick={() => setForma(f)}
            style={{
              padding:"10px 14px", borderRadius:10,
              border:`2px solid ${forma === f ? "var(--gd)" : "var(--sd)"}`,
              background: forma === f ? "var(--gd)" : "var(--wh)",
              color:       forma === f ? "#fff"      : "var(--tx)",
              fontWeight:600, fontSize:13, cursor:"pointer", textAlign:"left", transition:"all .15s",
            }}
          >
            {ICONES[f] || "💰"} {f}
          </button>
        ))}
      </div>

      <div className="btn-row" style={{ justifyContent:"center" }}>
        <button className="btn btn-out"  onClick={onClose}>Cancelar</button>
        <button className="btn btn-prim" onClick={() => onConfirmar(forma)}>Confirmar</button>
      </div>
    </div>
  );
}
