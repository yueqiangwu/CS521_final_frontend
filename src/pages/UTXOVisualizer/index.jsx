import React, { useEffect, useState } from "react";
import {
  getVisualizerState,
  getVisualizerHistory,
  postTransaction,
  postCreateMultisig,
  postResetState,
} from "@/api/visualizer";
import { message, Modal, Button } from "antd";

const OWNER_COLOR = { Alice: "primary", Bob: "success", Charlie: "warning" };

export default function UTXOVisualizer() {
  const [utxos, setUtxos] = useState([]);
  const [selectedInputs, setSelectedInputs] = useState({});
  const [outputs, setOutputs] = useState([]);
  const [history, setHistory] = useState([]);

  const [summary, setSummary] = useState({
    totalIn: 0,
    totalOut: 0,
    fee: 0,
  });

  const [showModal, setShowModal] = useState(false);

  // ───────────────────────────────
  // Load state
  // ───────────────────────────────
  const loadState = async () => {
    const d = await getVisualizerState();
    setUtxos(d.utxos);
  };

  const loadHistory = async () => {
    const d = await getVisualizerHistory();
    setHistory(d.history);
  };

  useEffect(() => {
    loadState();
    loadHistory();
  }, []);

  // ───────────────────────────────
  // Input selection
  // ───────────────────────────────
  const toggleInput = (u) => {
    const key = `${u.txid}:${u.vout}`;
    setSelectedInputs((prev) => {
      const copy = { ...prev };
      if (copy[key]) delete copy[key];
      else copy[key] = u;
      return copy;
    });
  };

  // ───────────────────────────────
  // Outputs
  // ───────────────────────────────
  const addOutput = () => {
    const amt = parseInt(document.getElementById("out-amount").value);
    const recipient = document.getElementById("out-recipient")?.value;
    const type = document.getElementById("out-type").value;

    if (!amt || amt <= 0) {
      message.warning("Invalid amount");
      return;
    }

    setOutputs((prev) => [
      ...prev,
      { recipient, amount: amt, script_type: type },
    ]);

    document.getElementById("out-amount").value = "";
  };

  const removeOutput = (i) => {
    setOutputs((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ───────────────────────────────
  // Summary
  // ───────────────────────────────
  useEffect(() => {
    const totalIn = Object.values(selectedInputs).reduce(
      (s, u) => s + u.amount,
      0
    );
    const totalOut = outputs.reduce((s, o) => s + o.amount, 0);

    setSummary({
      totalIn,
      totalOut,
      fee: totalIn - totalOut,
    });
  }, [selectedInputs, outputs]);

  // ───────────────────────────────
  // Submit
  // ───────────────────────────────
  const submitTransaction = async () => {
    try {
      const body = {
        inputs: Object.values(selectedInputs).map((u) => ({
          txid: u.txid,
          vout: u.vout,
        })),
        outputs,
      };

      const res = await postTransaction(body);

      if (res.success) {
        message.success("Transaction success");
        setSelectedInputs({});
        setOutputs([]);
        await loadState();
        await loadHistory();
      } else {
        message.error(res.error);
      }
    } catch (e) { }
  };

  // ───────────────────────────────
  // Reset
  // ───────────────────────────────
  const reset = async () => {
    await postResetState();
    setSelectedInputs({});
    setOutputs([]);
    loadState();
    loadHistory();
  };

  // ───────────────────────────────
  // Render
  // ───────────────────────────────
  return (
    <div className="container-fluid p-4">
      <h4 className="mb-3">⛓ Bitcoin UTXO Visualizer</h4>

      {/* Actions */}
      <div className="mb-3">
        <Button onClick={() => setShowModal(true)}>Create Multisig</Button>
        <Button danger className="ms-2" onClick={reset}>
          Reset
        </Button>
      </div>

      <div className="row">
        {/* UTXO Pool */}
        <div className="col-4">
          <div className="panel">
            <h6>UTXO Pool</h6>
            {utxos.map((u) => {
              const key = `${u.txid}:${u.vout}`;
              const selected = selectedInputs[key];

              return (
                <div
                  key={key}
                  className={`utxo-card ${selected ? "selected-card" : ""}`}
                  onClick={() => toggleInput(u)}
                >
                  <div>
                    <strong>{u.amount}</strong> sat
                  </div>
                  <div className="text-muted small">
                    {u.txid_short} #{u.vout}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Builder */}
        <div className="col-5">
          <div className="panel">
            <h6>Transaction Builder</h6>

            {/* Inputs */}
            <div>
              {Object.values(selectedInputs).map((u) => (
                <div key={u.txid + u.vout}>
                  {u.owner} - {u.amount}
                </div>
              ))}
            </div>

            {/* Add output */}
            <div className="mt-2">
              <select id="out-recipient">
                <option>Alice</option>
                <option>Bob</option>
                <option>Charlie</option>
              </select>
              <input id="out-amount" placeholder="amount" />
              <select id="out-type">
                <option>P2PKH</option>
                <option>P2WPKH</option>
              </select>
              <button onClick={addOutput}>+</button>
            </div>

            {/* Outputs */}
            {outputs.map((o, i) => (
              <div key={i}>
                {o.recipient} - {o.amount}
                <button onClick={() => removeOutput(i)}>x</button>
              </div>
            ))}

            {/* Summary */}
            <div className="mt-3">
              <div>In: {summary.totalIn}</div>
              <div>Out: {summary.totalOut}</div>
              <div>Fee: {summary.fee}</div>
            </div>

            <Button
              type="primary"
              disabled={
                !Object.keys(selectedInputs).length ||
                !outputs.length ||
                summary.fee < 0
              }
              onClick={submitTransaction}
            >
              Send
            </Button>
          </div>
        </div>

        {/* History */}
        <div className="col-3">
          <div className="panel">
            <h6>History</h6>
            {history.map((tx) => (
              <div key={tx.txid} className="hist-card">
                <div>{tx.txid_short}</div>
                <div>fee: {tx.fee}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Multisig Modal */}
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        onOk={async () => {
          await postCreateMultisig({
            m: 2,
            signers: ["Alice", "Bob"],
            amount: 100000,
            script_type: "P2SH",
          });
          setShowModal(false);
          loadState();
        }}
      >
        Create Multisig (simplified demo)
      </Modal>
    </div>
  );
}