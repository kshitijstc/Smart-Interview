import AuthForm from "@/components/AuthForm";
export default function LoginPage(){
    return(
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
            <AuthForm type="login"/>
            </div>
        </div>
    );
}