import {Bell, Globe, Loader2, LogOut, Mail, MapPin, Search, ShieldCheck, Users} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';
import {toast} from 'sonner';

// API & Store
import {logoutApi, openGooglePopup} from '@/api/auth';
import {getAllUsers, getMe} from '@/api/users';
import {useAuthStore, type User} from '@/store/useAuthStore';

// shadcn/ui components
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Separator} from '@/components/ui/separator';
import {Skeleton} from '@/components/ui/skeleton';

export default function App() {
	const {user, setAuth, logout} = useAuthStore();
	const [allUsers, setAllUsers] = useState<User[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [loadingUsers, setLoadingUsers] = useState(false);
	const [isLoggingIn, setIsLoggingIn] = useState(false);

	const handleLogin = async () => {
		setIsLoggingIn(true);
		try {
			const token = await openGooglePopup();
			// Bước đệm: Gắn token vào store ngay để getMe() không bị 401
			setAuth({id: 0, email: '', full_name: 'Authenticating...'}, token);

			const profile = await getMe();
			setAuth(profile, token);
			toast.success(`Welcome back, ${profile.full_name}!`);
		} catch (error: any) {
			logout();
			toast.error(error.response?.data?.detail || error.message || 'Login failed');
		} finally {
			setIsLoggingIn(false);
		}
	};

	const handleLogout = async () => {
		try {
			await logoutApi();
		} finally {
			logout();
			setAllUsers([]);
			toast.info('Logged out safely');
		}
	};

	useEffect(() => {
		if (user && user.id !== 0) {
			setLoadingUsers(true);
			getAllUsers()
				.then(setAllUsers)
				.catch(err => {
					if (err.response?.status === 401) logout();
				})
				.finally(() => setLoadingUsers(false));
		}
	}, [user]);

	// Lọc danh sách thành viên theo tìm kiếm
	const filteredUsers = useMemo(() => {
		return allUsers.filter(
			u =>
				(u.full_name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
				u.email.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [allUsers, searchQuery]);

	const initials = (name?: string) =>
		name
			?.split(' ')
			.map(n => n[0])
			.join('')
			.slice(0, 2)
			.toUpperCase() || 'U';

	// --- 1. MÀN HÌNH ĐĂNG NHẬP (Glassmorphism) ---
	if (!user || user.id === 0) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0a] p-4 overflow-hidden">
				{/* Hiệu ứng ánh sáng nền mờ */}
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>

				<Card className="w-full max-w-105 border-white/10 shadow-2xl bg-black/40 backdrop-blur-2xl text-white animate-in fade-in zoom-in duration-700">
					<CardHeader className="text-center space-y-6 pt-12">
						<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/20 rotate-6 transition-transform hover:rotate-0">
							<ShieldCheck className="h-10 w-10 text-white" />
						</div>
						<div className="space-y-2">
							<CardTitle className="text-4xl font-black tracking-tight uppercase">
								Portal.
							</CardTitle>
							<CardDescription className="text-slate-400 font-medium">
								Secure Access Control System
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="pt-8 pb-12 px-10">
						<Button
							size="lg"
							className="w-full h-14 text-lg font-bold transition-all active:scale-95 gap-3"
							onClick={handleLogin}
							disabled={isLoggingIn}>
							{isLoggingIn ? (
								<Loader2 className="animate-spin h-6 w-6" />
							) : (
								<>Continue with Google</>
							)}
						</Button>
					</CardContent>
					<CardFooter className="justify-center border-t border-white/5 py-6">
						<p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
							Encrypted End-to-End
						</p>
					</CardFooter>
				</Card>
			</div>
		);
	}

	// --- 2. GIAO DIỆN CHÍNH (Modern SaaS Dashboard) ---
	return (
		<div className="min-h-screen min-w-screen bg-[#f8fafc]">
			{/* Top Navbar */}
			<header className="sticky top-0 z-50 w-full border-b bg-white/70 backdrop-blur-md">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
					<div className="flex items-center gap-8">
						<div className="flex items-center gap-2">
							<div className="bg-blue-600 p-1.5 rounded-xl text-white shadow-lg shadow-blue-200">
								<Globe className="h-5 w-5" />
							</div>
							<span className="text-xl font-black tracking-tighter text-slate-900 uppercase">
								Portal.
							</span>
						</div>
						<nav className="hidden md:flex items-center gap-6">
							<Button variant="ghost" className="font-bold text-blue-600 bg-blue-50">
								Dashboard
							</Button>
							<Button variant="ghost" className="font-medium text-slate-500">
								Analytics
							</Button>
							<Button variant="ghost" className="font-medium text-slate-500">
								Infrastructure
							</Button>
						</nav>
					</div>

					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" className="relative text-slate-400">
							<Bell className="h-5 w-5" />
							<span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
						</Button>
						<Separator orientation="vertical" className="h-6" />
						<Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-200">
							<AvatarImage src={user.picture} />
							<AvatarFallback>{initials(user.full_name)}</AvatarFallback>
						</Avatar>
						<Button
							variant="outline"
							size="icon"
							onClick={handleLogout}
							className="rounded-xl hover:bg-red-50 hover:text-red-600 border-slate-200">
							<LogOut className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-7xl px-6 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Cột trái: User Profile Sidebar */}
					<div className="lg:col-span-4 space-y-6">
						<Card className="border-none shadow-sm overflow-hidden ring-1 ring-slate-200">
							<div className="h-24 bg-linear-to-r from-blue-600 to-indigo-700" />
							<div className="px-6 pb-8 -mt-12 text-center">
								<Avatar className="h-24 w-24 mx-auto border-4 border-white shadow-xl">
									<AvatarImage src={user.picture} />
									<AvatarFallback className="text-2xl">
										{initials(user.full_name)}
									</AvatarFallback>
								</Avatar>
								<div className="mt-4 space-y-1">
									<h3 className="text-xl font-bold text-slate-900">
										{user.full_name}
									</h3>
									<div className="flex items-center justify-center gap-2">
										<Badge className="bg-green-500/10 text-green-600 border-none hover:bg-green-500/20">
											Active Now
										</Badge>
									</div>
								</div>

								<div className="mt-8 grid grid-cols-2 gap-4 text-left">
									<div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
										<p className="text-[10px] font-bold text-slate-400 uppercase">
											System ID
										</p>
										<p className="text-sm font-bold text-slate-700">
											#00{user.id}
										</p>
									</div>
									<div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
										<p className="text-[10px] font-bold text-slate-400 uppercase">
											Region
										</p>
										<p className="text-sm font-bold text-slate-700">Vietnam</p>
									</div>
								</div>

								<div className="mt-6 space-y-3 text-left">
									<div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
										<div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-blue-600">
											<Mail className="h-4 w-4" />
										</div>
										<span className="text-xs font-medium text-slate-600 truncate">
											{user.email}
										</span>
									</div>
									<div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
										<div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-blue-600">
											<MapPin className="h-4 w-4" />
										</div>
										<span className="text-xs font-medium text-slate-600">
											Ho Chi Minh City, VN
										</span>
									</div>
								</div>
							</div>
						</Card>

						<Card className="bg-slate-900 text-white border-none shadow-xl shadow-blue-900/10">
							<CardHeader>
								<CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">
									System Logs
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between text-xs">
									<span className="text-slate-400">Auth Method</span>
									<span className="font-bold text-blue-400">
										Google OAuth 2.0
									</span>
								</div>
								<div className="flex items-center justify-between text-xs">
									<span className="text-slate-400">Last Synced</span>
									<span className="font-bold">Just now</span>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Cột phải: Main Community Feed */}
					<div className="lg:col-span-8 space-y-6">
						<Card className="border-none shadow-sm ring-1 ring-slate-200">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b">
								<div className="space-y-1">
									<CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
										<Users className="h-6 w-6 text-blue-600" /> COMMUNITY
									</CardTitle>
									<CardDescription>
										Network nodes registered in the portal
									</CardDescription>
								</div>
								<div className="relative w-64">
									<Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
									<Input
										placeholder="Search members..."
										className="pl-10 rounded-xl bg-slate-50 border-none focus-visible:ring-blue-600"
										value={searchQuery}
										onChange={e => setSearchQuery(e.target.value)}
									/>
								</div>
							</CardHeader>
							<CardContent className="p-0">
								<ScrollArea className="h-150">
									<div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
										{loadingUsers ? (
											Array(6)
												.fill(0)
												.map((_, i) => (
													<div
														key={i}
														className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl animate-pulse">
														<Skeleton className="h-12 w-12 rounded-full" />
														<div className="flex-1 space-y-2">
															<Skeleton className="h-4 w-1/2" />
															<Skeleton className="h-3 w-3/4" />
														</div>
													</div>
												))
										) : filteredUsers.length > 0 ? (
											filteredUsers.map(u => (
												<div
													key={u.id}
													className={`group flex items-center justify-between p-4 rounded-2xl border transition-all hover:shadow-lg hover:border-blue-200 ${u.id === user.id ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-500/20' : 'bg-white border-slate-100'}`}>
													<div className="flex items-center gap-4">
														<div className="relative">
															<Avatar className="h-12 w-12 transition-transform group-hover:scale-105">
																<AvatarImage src={u.picture} />
																<AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
																	{initials(u.full_name)}
																</AvatarFallback>
															</Avatar>
															{u.id === user.id && (
																<div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full border-2 border-white"></div>
															)}
														</div>
														<div>
															<p className="font-bold text-slate-900 leading-tight flex items-center gap-2">
																{u.full_name}
																{u.id === user.id && (
																	<Badge className="bg-blue-600 h-4 text-[8px] uppercase">
																		You
																	</Badge>
																)}
															</p>
															<p className="text-xs text-slate-500 font-medium">
																{u.email}
															</p>
														</div>
													</div>
												</div>
											))
										) : (
											<div className="col-span-2 py-20 text-center space-y-4">
												<Search className="h-12 w-12 mx-auto text-slate-200" />
												<p className="text-slate-400 font-medium">
													No members found for "{searchQuery}"
												</p>
											</div>
										)}
									</div>
								</ScrollArea>
							</CardContent>
							<CardFooter className="bg-slate-50/50 border-t p-4 flex justify-between items-center">
								<p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
									Verified Cluster v1.0.4
								</p>
								<Badge variant="secondary" className="font-bold">
									{allUsers.length} TOTAL NODES
								</Badge>
							</CardFooter>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
