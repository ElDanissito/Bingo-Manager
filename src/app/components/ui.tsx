import clsx from 'clsx';

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
	const { className, ...rest } = props;
	return <div className={clsx('card p-4', className)} {...rest} />;
}

export function Button(
	props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'success' }
) {
	const { className, variant = 'primary', ...rest } = props;
	const base = 'px-3 py-2 rounded-md font-medium focus-ring transition-colors';
	const variants: Record<string, string> = {
		primary: 'button-primary',
		secondary: 'button-secondary',
		danger: 'bg-red-600 text-white hover:bg-red-500',
		success: 'bg-green-600 text-white hover:bg-green-500',
	};
	return <button className={clsx(base, variants[variant], className)} {...rest} />;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
	const { className, ...rest } = props;
	return <input className={clsx('input focus-ring rounded-md px-3 py-2', className)} {...rest} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
	const { className, children, ...rest } = props;
	return (
		<select className={clsx('input focus-ring rounded-md px-3 py-2', className)} {...rest}>
			{children}
		</select>
	);
}

export function Table(props: React.HTMLAttributes<HTMLTableElement>) {
	const { className, ...rest } = props;
	return <table className={clsx('min-w-full text-sm card', className)} {...rest} />;
}

export function Badge(props: React.HTMLAttributes<HTMLSpanElement>) {
	const { className, ...rest } = props;
	return <span className={clsx('badge text-xs px-2 py-1 rounded', className)} {...rest} />;
}
