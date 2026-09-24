package com.autoquote.copilot.exception;

public class VehicleNotFoundException extends RuntimeException {
    public VehicleNotFoundException(String placa) {
        super("Veiculo nao encontrado para a placa: " + placa
                + " (nesta PoC apenas as placas cadastradas em data.sql sao reconhecidas)");
    }
}
