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

    private static final Font FONT_TITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, BaseColor.BLACK);
    private static final Font FONT_CATEGORIA = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, BaseColor.DARK_GRAY);
    private static final Font FONT_CABECALHO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, BaseColor.WHITE);
    private static final Font FONT_LINHA = FontFactory.getFont(FontFactory.HELVETICA, 11, BaseColor.BLACK);
    private static final Font FONT_NC = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, BaseColor.RED);

    public byte[] gerarRelatorioFinalPdf(String nomeCampeonato, Map<String, List<ClassificacaoDTO>> relatorioMisto) {
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            adicionarTitulo(document, nomeCampeonato);

            for (Map.Entry<String, List<ClassificacaoDTO>> entry : relatorioMisto.entrySet()) {
                adicionarSecaoCategoria(document, entry.getKey(), entry.getValue());
            }

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Erro ao gerar o arquivo PDF: " + e.getMessage(), e);
        }
        return out.toByteArray();
    }

    private void adicionarTitulo(Document document, String nomeCampeonato) throws DocumentException {
        Paragraph titulo = new Paragraph(nomeCampeonato + "\n" + "Resultado Final:", FONT_TITULO);
        titulo.setAlignment(Element.ALIGN_CENTER);
        titulo.setSpacingAfter(20);
        document.add(titulo);
    }

    private void adicionarSecaoCategoria(Document document, String nomeCategoria, List<ClassificacaoDTO> pilotos) throws DocumentException {
        if (pilotos.isEmpty()) return;

        Paragraph pCategoria = new Paragraph("Categoria: " + nomeCategoria, FONT_CATEGORIA);
        pCategoria.setSpacingBefore(15);
        pCategoria.setSpacingAfter(10);
        document.add(pCategoria);

        List<String> nomesBaterias = new ArrayList<>(pilotos.get(0).getResultadosPorBateria().keySet());
        int numColunas = 4 + nomesBaterias.size();

        PdfPTable table = new PdfPTable(numColunas);
        table.setWidthPercentage(100);

        criarCabecalho(table, nomesBaterias);
        preencherDadosPilotos(table, pilotos, nomesBaterias);

        document.add(table);
    }

    private void criarCabecalho(PdfPTable table, List<String> nomesBaterias) {
        addCelulaCabecalho(table, "Pos");
        addCelulaCabecalho(table, "Kart");
        addCelulaCabecalho(table, "Piloto");
        for (String nomeBat : nomesBaterias) {
            addCelulaCabecalho(table, nomeBat);
        }
        addCelulaCabecalho(table, "Total");
    }

    private void preencherDadosPilotos(PdfPTable table, List<ClassificacaoDTO> pilotos, List<String> nomesBaterias) {
        int pos = 1;
        for (ClassificacaoDTO dto : pilotos) {
            table.addCell(new PdfPCell(new Phrase(pos + "º", FONT_LINHA)));
            table.addCell(new PdfPCell(new Phrase("#" + dto.getPiloto().getNumeroKart(), FONT_LINHA)));
            table.addCell(new PdfPCell(new Phrase(dto.getPiloto().getNome(), FONT_LINHA)));

            for (String nomeBat : nomesBaterias) {
                String valor = dto.getResultadosPorBateria().getOrDefault(nomeBat, "-");
                PdfPCell cell = new PdfPCell(new Phrase(valor, "NC".equals(valor) ? FONT_NC : FONT_LINHA));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            PdfPCell cellTotal = new PdfPCell(new Phrase(dto.getTotalPontos() + " pts", FONT_LINHA));
            cellTotal.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cellTotal);
            pos++;
        }
    }

    private void addCelulaCabecalho(PdfPTable table, String texto) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, FONT_CABECALHO));
        cell.setBackgroundColor(BaseColor.DARK_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(6);
        table.addCell(cell);
    }
}