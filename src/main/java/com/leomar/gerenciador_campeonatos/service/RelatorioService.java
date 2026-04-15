package com.leomar.gerenciador_campeonatos.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.leomar.gerenciador_campeonatos.dto.ClassificacaoDTO;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class RelatorioService {

    public byte[] gerarRelatorioFinalPdf(String nomeCampeonato, Map<String, List<ClassificacaoDTO>> relatorioMisto) {
        // Configuramos a página para A4 Deitada (Landscape) para caberem várias colunas de baterias
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // 1. O Título do Documento
            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, BaseColor.BLACK);
            Paragraph titulo = new Paragraph("🏆 Resultado Oficial: " + nomeCampeonato, fontTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(20);
            document.add(titulo);

            // 2. Itera sobre cada Categoria (F4 A, F4 B, Cadete...)
            for (Map.Entry<String, List<ClassificacaoDTO>> entry : relatorioMisto.entrySet()) {
                String nomeCategoria = entry.getKey();
                List<ClassificacaoDTO> pilotos = entry.getValue();

                if (pilotos.isEmpty()) continue;

                // Subtítulo da Categoria
                Font fontCategoria = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, BaseColor.DARK_GRAY);
                Paragraph pCategoria = new Paragraph("Categoria: " + nomeCategoria, fontCategoria);
                pCategoria.setSpacingBefore(15);
                pCategoria.setSpacingAfter(10);
                document.add(pCategoria);

                // 3. Mágica das Colunas Dinâmicas: Descobre quantas baterias foram corridas
                List<String> nomesBaterias = new ArrayList<>(pilotos.get(0).getResultadosPorBateria().keySet());
                int numColunas = 4 + nomesBaterias.size(); // Pos, Kart, Piloto, [B1, B2...], Total

                PdfPTable table = new PdfPTable(numColunas);
                table.setWidthPercentage(100);

                // 4. Cabeçalho da Tabela
                Font fontCabecalho = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, BaseColor.WHITE);
                addCabecalho(table, "Pos", fontCabecalho);
                addCabecalho(table, "Kart", fontCabecalho);
                addCabecalho(table, "Piloto", fontCabecalho);
                for (String nomeBat : nomesBaterias) {
                    addCabecalho(table, nomeBat, fontCabecalho); // Adiciona "Bateria 1", "Bateria 2"...
                }
                addCabecalho(table, "Total", fontCabecalho);

                // 5. Linhas dos Pilotos
                Font fontLinha = FontFactory.getFont(FontFactory.HELVETICA, 11, BaseColor.BLACK);
                Font fontNC = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, BaseColor.RED); // NC em Vermelho!

                int pos = 1;
                for (ClassificacaoDTO dto : pilotos) {
                    // Dados Básicos
                    table.addCell(new PdfPCell(new Phrase(pos + "º", fontLinha)));
                    table.addCell(new PdfPCell(new Phrase("#" + dto.getPiloto().getNumeroKart(), fontLinha)));
                    table.addCell(new PdfPCell(new Phrase(dto.getPiloto().getNome(), fontLinha)));

                    // Pontos das Baterias (Procura o NC)
                    for (String nomeBat : nomesBaterias) {
                        String valor = dto.getResultadosPorBateria().getOrDefault(nomeBat, "-");
                        // Se for NC, usa a fonte vermelha. Se não, fonte normal.
                        PdfPCell cell = new PdfPCell(new Phrase(valor, valor.equals("NC") ? fontNC : fontLinha));
                        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                        table.addCell(cell);
                    }

                    // Total de Pontos
                    PdfPCell cellTotal = new PdfPCell(new Phrase(dto.getTotalPontos() + " pts", fontLinha));
                    cellTotal.setHorizontalAlignment(Element.ALIGN_CENTER);
                    table.addCell(cellTotal);

                    pos++;
                }

                document.add(table);
            }

            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }
        return out.toByteArray();
    }

    // Método auxiliar para pintar o fundo do cabeçalho de cinza escuro
    private void addCabecalho(PdfPTable table, String texto, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, font));
        cell.setBackgroundColor(BaseColor.DARK_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(6);
        table.addCell(cell);
    }
}