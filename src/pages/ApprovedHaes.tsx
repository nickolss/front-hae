import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services";
import { AppLayout } from "@/layouts";
import { HaeResponseDTO } from "@/types/hae";
import { CircularProgress, Alert } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import { AxiosError } from "axios";

export const ApprovedHaes = () => {
	const { user, loading: userLoading } = useAuth();
	const [haes, setHaes] = useState<HaeResponseDTO[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const navigate = useNavigate();

	useEffect(() => {
		const fetchApprovedHaes = async () => {
			try {
				setLoading(true);
				setError("");

				let response;

				// Se o usuário tiver instituição, usar o endpoint de busca avançada
				if (user?.institution?.id) {
					console.log(
						"Buscando HAEs aprovadas da instituição:",
						user.institution.id
					);

					const params: { [key: string]: string } = {
						institutionId: user.institution.id,
						status: "COMPLETO",
					};

					response = await api.get<HaeResponseDTO[]>("/hae/search", { params });
				} else {
					// Caso contrário, usar o endpoint direto por status
					console.log(
						"Buscando todas as HAEs aprovadas (sem filtro de instituição)"
					);
					response = await api.get<HaeResponseDTO[]>(
						"/hae/getHaeByStatus/COMPLETO"
					);
				}

				console.log("Resposta da API:", response.data);
				console.log("Quantidade de HAEs retornadas:", response.data.length);

				// A API já filtra pelo status solicitado, então usamos diretamente
				setHaes(response.data);
			} catch (err) {
				console.error("Erro ao carregar HAEs aprovadas:", err);
				let errorMessage = "Erro ao carregar as HAEs aprovadas";

				if (err instanceof AxiosError) {
					console.error("Detalhes do erro:", {
						status: err.response?.status,
						data: err.response?.data,
						message: err.message,
						url: err.config?.url,
					});
					errorMessage =
						err.response?.data?.message || err.message || errorMessage;
				}

				setError(errorMessage);
			} finally {
				setLoading(false);
			}
		};

		if (!userLoading) {
			fetchApprovedHaes();
		}
	}, [user, userLoading]);

	const handleViewClosure = (haeId: string) => {
		navigate(`/view-closure-request/${haeId}`);
	};

	return (
		<AppLayout>
			<main className="col-start-2 row-start-2 p-4 md:p-6 overflow-auto pt-20 md:pt-4">
				<h2 className="subtitle font-semibold mb-2">HAEs Aprovadas</h2>
				<p className="max-w-3xl mb-6 text-gray-600">
					Visualize todas as HAEs aprovadas. Clique em uma HAE para ver os
					detalhes da solicitação de fechamento.
				</p>

				{(loading || userLoading) && (
					<div className="flex justify-center items-center py-10">
						<CircularProgress
							size={70}
							sx={{ "& .MuiCircularProgress-circle": { stroke: "#c10007" } }}
						/>
					</div>
				)}

				{error && (
					<Alert severity="error" className="mb-4">
						{error}
						<br />
						<small className="mt-2 block">
							Verifique o console do navegador para mais detalhes.
						</small>
					</Alert>
				)}

				{!loading && !userLoading && haes.length === 0 && !error && (
					<div className="bg-white rounded-lg shadow p-8 text-center">
						<p className="text-gray-500 text-lg">
							Não há HAEs aprovadas no momento.
						</p>
						{user?.institution?.id && (
							<p className="text-gray-400 text-sm mt-2">
								Filtrando por instituição: {user.institution.name}
							</p>
						)}
					</div>
				)}

				{!loading && haes.length > 0 && (
					<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
						{haes.map((hae) => (
							<div
								key={hae.id}
								className="bg-white rounded-md shadow p-6 border border-gray-200 flex flex-col h-72 cursor-pointer transition-shadow hover:shadow-lg"
								onClick={() => handleViewClosure(hae.id)}
							>
								<div className="flex justify-between items-start mb-4">
									<div className="flex-1 min-w-0 pr-4">
										<h2 className="text-xl font-semibold text-gray-800 truncate mb-1">
											{hae.projectTitle}
										</h2>
									</div>
									<div className="flex-shrink-0">
										<span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
											APROVADO
										</span>
									</div>
								</div>

								<div className="flex-grow space-y-2 mb-4">
									<div className="flex items-center gap-1.5 text-sm text-gray-600">
										<span className="font-medium">Curso:</span>
										<span className="truncate">{hae.course}</span>
									</div>

									<div className="flex items-center gap-1.5 text-sm text-gray-600">
										<span className="font-medium">Professor:</span>
										<span className="truncate">{hae.professorName}</span>
									</div>

									<div className="flex items-start gap-1.5 text-sm text-gray-600">
										<span className="font-medium">Descrição:</span>
										<p className="line-clamp-2 text-gray-700">
											{hae.projectDescription}
										</p>
									</div>
								</div>

								<div className="flex justify-end items-center mt-auto pt-4 border-t border-gray-100">
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleViewClosure(hae.id);
										}}
										className="btnFatec text-white uppercase hover:bg-red-900"
									>
										Ver Solicitação de Fechamento
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</main>
		</AppLayout>
	);
};
