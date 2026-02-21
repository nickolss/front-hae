import StepperForm from "@/components/StepperForm/StepperForm";
import { AppLayout } from "@/layouts";

export const RequestHae = () => {
  return (
    <AppLayout>
      <main className="col-start-2 row-start-2 p-4 overflow-auto pt-20 md:pt-4 h-full">
        <h2 className="subtitle font-semibold">Solicitação de HAE</h2>
        <p>
          Preencha os campos abaixo com as informações da sua nova Atividade
          Extracurricular. Assegure-se de fornecer todos os dados necessários
          para a avaliação da sua solicitação.
        </p>
        <StepperForm />
      </main>
    </AppLayout>
  );
};
