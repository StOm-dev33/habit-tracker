export default function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      className="flex items-center justify-center min-h-screen bg-indigo-600"
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Habit Tracker</h1>
        <p className="text-indigo-200 text-lg">Building better habits, one day at a time</p>
        <div className="mt-6">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
