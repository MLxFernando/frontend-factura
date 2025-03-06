import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://back-end-y0wl.onrender.com"; 

function App() {
  const [facturas, setFacturas] = useState([]);
  const [cliente, setCliente] = useState("");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [notification, setNotification] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [selectedMetodo, setSelectedMetodo] = useState("");

  useEffect(() => {
    fetchFacturas(); 
  
    const interval = setInterval(() => {
      fetchFacturas(); 
    }, 1000);
  
    return () => clearInterval(interval); // Limpiar el intervalo al desmontar
  }, []);

  const fetchFacturas = async () => {
    try {
      const response = await axios.get(`${API_URL}/facturas`, { headers: { "Cache-Control": "no-cache" } });
      setFacturas(response.data);
    } catch (error) {
      console.error("Error al obtener facturas", error);
    }
  };

  const crearFactura = async () => {
    if (!cliente || !monto || !descripcion) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      await axios.post(`${API_URL}/crear/factura`, {
        cliente,
        monto,
        descripcion,
      });
      fetchFacturas(); 
      setCliente("");
      setMonto("");
      setDescripcion("");
    } catch (error) {
      console.error("Error al crear factura", error);
    }
  };

  const abrirModalPago = (factura) => {
    setSelectedFactura(factura);
    setShowModal(true);
  };

  const procesarPago = async () => {
    if (!selectedMetodo) {
      alert("Por favor selecciona un método de pago");
      return;
    }

    setShowModal(false);
    setLoadingId(selectedFactura.id);

    setTimeout(async () => {
      try {
         await axios.post(`${API_URL}/facturas/pagar/${selectedFactura.id}`);
        fetchFacturas();
        setNotification(`✅ ${selectedFactura.cliente} pagó la factura #${selectedFactura.id} con ${selectedMetodo}.`);
        setLoadingId(null);

        setTimeout(() => setNotification(""), 3000);
      } catch (error) {
        console.error("Error al pagar factura", error);
        setLoadingId(null);
      }
    }, 3000);
  };

  return (
    <div className="container">
      <h1>💳 Gestión de Facturas</h1>

      {notification && <div className="notification">{notification}</div>}

      <h2>📄 Registrar Factura</h2>
      <div className="form-group">
        <input type="text" placeholder="Cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
        <input type="number" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)} />
        <input type="text" placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <button className="crear" onClick={crearFactura}>Crear Factura</button>
      </div>

      <div className="facturas">
        <h2>📜 Facturas Registradas</h2>
        <ul>
          {facturas.map((factura) => (
            <li key={factura.id} className={factura.estado === "Pagada" ? "factura-pagada" : "factura-pendiente"}>
              <span><strong>Cliente:</strong> {factura.cliente} | <strong>Monto:</strong> ${factura.monto}</span>
              <span><strong>Descripción:</strong> {factura.descripcion}</span>
              <span><strong>Estado:</strong> {factura.estado}</span>
              {factura.estado === "Pendiente" && (
                <button className="pagar" onClick={() => abrirModalPago(factura)} disabled={loadingId === factura.id}>
                  {loadingId === factura.id ? "Procesando..." : "Pagar"}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Modal de Pago */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Selecciona un método de pago</h3>
            <select onChange={(e) => setSelectedMetodo(e.target.value)} value={selectedMetodo}>
              <option value="">-- Seleccionar --</option>
              <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
              <option value="Transferencia Bancaria">Transferencia Bancaria</option>
              <option value="PayPal">PayPal</option>
            </select>
            <button className="pay" onClick={procesarPago}>Confirmar Pago</button>
            <button className="close" onClick={() => setShowModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
