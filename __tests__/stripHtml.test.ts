import { stripHtml } from '../src/utils/stripHtml';

describe('stripHtml (RF03)', () => {
  it('remove as tags e mantém o texto', () => {
    expect(stripHtml('<p>Uma <b>série</b> de <i>mistério</i>.</p>')).toBe('Uma série de mistério.');
  });

  it('converte <br> e parágrafos em quebras de linha', () => {
    expect(stripHtml('<p>Linha 1</p><p>Linha 2</p>')).toBe('Linha 1\n\nLinha 2');
    expect(stripHtml('A<br>B<br/>C')).toBe('A\nB\nC');
  });

  it('decodifica entidades nomeadas e numéricas', () => {
    expect(stripHtml('Tom &amp; Jerry &quot;juntos&quot; &#39;sempre&#39; &#x41; &nbsp;fim')).toBe(
      'Tom & Jerry "juntos" \'sempre\' A fim',
    );
  });

  it('mantém entidades desconhecidas como estão', () => {
    expect(stripHtml('a &desconhecida; b')).toBe('a &desconhecida; b');
  });

  it('descarta <script> e <style> com o conteúdo', () => {
    expect(stripHtml('<style>p{color:red}</style>Oi<script>alert(1)</script>')).toBe('Oi');
  });

  it('normaliza espaços e linhas em branco repetidas', () => {
    expect(stripHtml('  muitos    espaços\n\n\n\nfim  ')).toBe('muitos espaços\n\nfim');
  });

  it('aceita vazio, null e undefined', () => {
    expect(stripHtml('')).toBe('');
    expect(stripHtml(null)).toBe('');
    expect(stripHtml(undefined)).toBe('');
  });
});
