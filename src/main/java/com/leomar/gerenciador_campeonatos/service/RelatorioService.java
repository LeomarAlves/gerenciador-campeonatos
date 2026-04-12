package com.leomar.gerenciador_campeonatos.service;

import com.leomar.gerenciador_campeonatos.dto.RankingItem;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class RelatorioService {

    // Retornamos um array de bytes (byte[]) que é o formato cru do arquivo,
    // perfeito para ser enviado pela internet para o Frontend fazer o download.
    public byte[] gerarRelatorioFinal(String nomeCampeonato, String nomeCategoria, List<RankingItem> rankingDessaCategoria) {

        // 1. Prepara a folha de papel digital em branco
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            // 2. Conecta a folha de papel à nossa "impressora" virtual (o ByteArray)
            PdfWriter.getInstance(document, out);
            document.open();

            // 3. Desenhando o Cabeçalho (Títulos)
            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph titulo = new Paragraph("Resultado Final - " + nomeCampeonato, fontTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            document.add(titulo);

            Font fontSubtitulo = FontFactory.getFont(FontFactory.HELVETICA, 14);
            Paragraph subtitulo = new Paragraph("Categoria: " + nomeCategoria, fontSubtitulo);
            subtitulo.setAlignment(Element.ALIGN_CENTER);
            subtitulo.setSpacingAfter(20f); // Dá um espaço antes de começar a tabela
            document.add(subtitulo);

            // 4. Criando a Tabela (3 colunas: Posição, Piloto, Pontos)
            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100); // A tabela vai ocupar toda a largura da página

            // 5. Desenhando o cabeçalho da tabela (linha preta, texto branco)
            Font fontCabecalhoTabela = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            PdfPCell h1 = new PdfPCell(new Phrase("Posição", fontCabecalhoTabela));
            PdfPCell h2 = new PdfPCell(new Phrase("Piloto", fontCabecalhoTabela));
            PdfPCell h3 = new PdfPCell(new Phrase("Total de Pontos", fontCabecalhoTabela));

            table.addCell(h1);
            table.addCell(h2);
            table.addCell(h3);

            // 6. Preenchendo a tabela com os dados reais do seu RankingItem
            int posicao = 1;
            for (RankingItem item : rankingDessaCategoria) {
                table.addCell(String.valueOf(posicao)); // Coluna 1: Posição
                table.addCell(item.getPiloto().getNome()); // Coluna 2: Nome do Piloto
                table.addCell(String.valueOf(item.getTotalPontos())); // Coluna 3: Pontos Totais

                posicao++;
            }

            // 7. Adiciona a tabela finalizada na página
            document.add(table);

        } catch (DocumentException e) {
            throw new RuntimeException("Erro ao gerar o PDF do campeonato", e);
        } finally {
            // 8. Fecha o documento para finalizar o arquivo
            document.close();
        }

        // Retorna o arquivo pronto!
        return out.toByteArray();
    }
}