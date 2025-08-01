import Image from "next/image";
import ProjectForm from "@/modules/home/ui/components/project-form";
import ProjectsList from "@/modules/home/ui/components/projects-list";
export default function Home() {
  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-6 py-[16vh] 2xl:py-48">
        <div className="flex flex-col items-center">
          <Image
            src={"/Logo.svg"}
            alt="AppC"
            width={50}
            height={50}
            className="md:block"
          ></Image>
        </div>
        <h1 className="text-2xl md:text-5xl font-bold text-center">
          Build something with The AppCreator
        </h1>
        <p className="text-lg md:text-xl text-center text-muted-foreground">
          Create your first app in minutes with an AI
        </p>
        <div className="max-w-3xl mx-auto w-full">
          <ProjectForm />
        </div>
      </section>
      <ProjectsList />
    </div>
  );
}
