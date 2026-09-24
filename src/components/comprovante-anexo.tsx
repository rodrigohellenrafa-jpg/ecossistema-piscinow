import { useRef, useState } from "react";
import { Eye, Loader2, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const BUCKET = "comprovantes";
const TAMANHO_MAX = 10 * 1024 * 1024;

/**
 * Anexo de comprovante (foto do Pix, boleto em PDF etc.) opcional em cada
 * pagamento. Guarda o caminho do arquivo no bucket privado "comprovantes"
 * e devolve o caminho para o formulário salvar junto com o pagamento.
 */
export function ComprovanteAnexo({
  tabela,
  valor,
  onChange,
}: {
  tabela: string;
  valor: string | null;
  /** Opcional: sem onChange, o anexo fica só para visualização. */
  onChange?: (novo: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [abrindo, setAbrindo] = useState(false);

  async function subir(file: File) {
    if (file.size > TAMANHO_MAX) {
      toast.error("Arquivo maior que 10 MB. Compacte ou envie um PDF menor.");
      return;
    }
    setEnviando(true);
    try {
      const extensao = (file.name.split(".").pop() ?? "bin").toLowerCase();
      const caminho = `${tabela}/${Date.now()}-${crypto.randomUUID()}.${extensao}`;
      const { error } = await supabase.storage.from(BUCKET).upload(caminho, file, {
        upsert: false,
      });
      if (error) throw error;
      onChange?.(caminho);
      toast.success("Comprovante anexado. Lembre de salvar o pagamento.");
    } catch (e) {
      toast.error(
        e instanceof Error && e.message ? e.message : "Não foi possível anexar o comprovante.",
      );
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function abrir() {
    if (!valor) return;
    setAbrindo(true);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(valor, 60 * 60);
      if (error || !data?.signedUrl) throw error ?? new Error("Sem link");
      window.open(data.signedUrl, "_blank", "noopener");
    } catch {
      toast.error("Não foi possível abrir o comprovante.");
    } finally {
      setAbrindo(false);
    }
  }

  async function remover() {
    const antigo = valor;
    onChange?.(null);
    if (antigo) {
      const { error } = await supabase.storage.from(BUCKET).remove([antigo]);
      if (error) toast.error("Não foi possível remover o arquivo do anexo.");
    }
  }

  if (valor) {
    return (
      <div className="flex items-center gap-1">
        <Button type="button" variant="outline" size="sm" onClick={abrir} disabled={abrindo}>
          {abrindo ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
          Ver comprovante
        </Button>
        {onChange && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            aria-label="Remover comprovante"
            onClick={remover}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void subir(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={enviando}
      >
        {enviando ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />}
        Anexar comprovante
      </Button>
    </>
  );
}
