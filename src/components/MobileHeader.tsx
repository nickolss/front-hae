import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import { useAuth } from "@/hooks/useAuth";
import { EmployeeInfoDisplay } from "@components/EmployeeInfoDisplay";

type MobileHeaderProps = {
	onMenuClick: () => void;
};

export const MobileHeader = ({ onMenuClick }: MobileHeaderProps) => {
	const { user, loading } = useAuth();

	return (
		<header className="md:hidden fixed top-0 left-0 w-full bg-white shadow z-50 flex justify-between items-center px-4 h-16">
			<IconButton onClick={onMenuClick} aria-label="Abrir menu">
				<MenuIcon className="text-gray-800" />
			</IconButton>

			<div className="flex-grow flex justify-end">
				<EmployeeInfoDisplay
					employee={user}
					isLoading={loading}
					showIcon={false}
				/>
			</div>
		</header>
	);
};
